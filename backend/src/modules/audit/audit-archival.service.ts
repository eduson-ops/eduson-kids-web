import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { gzipSync, gunzipSync } from 'zlib';
import { Readable } from 'stream';
import { AuditLog } from './audit.entity';

/**
 * D2-16: Archive audit logs to YC Object Storage before deletion.
 *
 * 152-ФЗ requires retention of audit-relevant events for ≥1 year (often 2y).
 * Plain DB-delete (previous behaviour) loses regulator-requested logs.
 *
 * Strategy:
 *   1. Group rows older than RETAIN_DAYS by (tenant_id, day_bucket).
 *   2. For each bucket: serialize rows → NDJSON → gzip → PUT to S3 at
 *      `audit-archive/{tenantId}/{YYYY-MM-DD}.ndjson.gz`.
 *   3. After successful upload: delete those rows from DB.
 *   4. Idempotent: skip bucket if S3 object already exists (HEAD 200).
 *
 * Graceful degradation: if AUDIT_ARCHIVE_BUCKET / credentials are unset,
 * the cron is a no-op (DB-only mode for local/dev).
 *
 * Restore: `scripts/audit-restore.mjs` (CLI). See repo root.
 */

interface ArchivalConfig {
  bucket: string;
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  retainDays: number;
}

interface ArchiveStats {
  bucketsProcessed: number;
  bucketsSkipped: number;
  rowsArchived: number;
  bytesUploaded: number;
}

@Injectable()
export class AuditArchivalService {
  private readonly logger = new Logger(AuditArchivalService.name);
  private readonly cfg: ArchivalConfig | null;
  private readonly s3: S3Client | null;

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
    private readonly configService: ConfigService,
  ) {
    this.cfg = this.loadConfig();
    this.s3 = this.cfg ? this.buildClient(this.cfg) : null;
  }

  private loadConfig(): ArchivalConfig | null {
    const bucket = this.configService.get<string>('AUDIT_ARCHIVE_BUCKET');
    const accessKeyId = this.configService.get<string>(
      'AUDIT_ARCHIVE_ACCESS_KEY_ID',
    );
    const secretAccessKey = this.configService.get<string>(
      'AUDIT_ARCHIVE_SECRET_ACCESS_KEY',
    );
    if (!bucket || !accessKeyId || !secretAccessKey) {
      return null;
    }
    return {
      bucket,
      accessKeyId,
      secretAccessKey,
      endpoint:
        this.configService.get<string>('AUDIT_ARCHIVE_ENDPOINT') ??
        'https://storage.yandexcloud.net',
      region:
        this.configService.get<string>('AUDIT_ARCHIVE_REGION') ?? 'ru-central1',
      retainDays: parseInt(
        this.configService.get<string>('AUDIT_ARCHIVE_RETAIN_DAYS') ?? '90',
        10,
      ),
    };
  }

  private buildClient(cfg: ArchivalConfig): S3Client {
    return new S3Client({
      region: cfg.region,
      endpoint: cfg.endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: cfg.accessKeyId,
        secretAccessKey: cfg.secretAccessKey,
      },
    });
  }

  isConfigured(): boolean {
    return this.cfg !== null && this.s3 !== null;
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async runDailyArchive(): Promise<void> {
    if (!this.cfg || !this.s3) {
      this.logger.warn(
        'AUDIT_ARCHIVE_BUCKET / credentials not set — skipping audit archival (DB-only mode).',
      );
      return;
    }
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - this.cfg.retainDays);
    this.logger.log(
      `Audit archival starting; cutoff=${cutoff.toISOString()} (retain ${this.cfg.retainDays}d)`,
    );
    const stats = await this.archiveBeforeDate(cutoff);
    this.logger.log(
      `Audit archival done: buckets=${stats.bucketsProcessed} skipped=${stats.bucketsSkipped} ` +
        `rows=${stats.rowsArchived} bytes=${stats.bytesUploaded}`,
    );
  }

  /**
   * Archive all audit rows where created_at < date. Returns stats.
   * Public for testing + CLI use.
   */
  async archiveBeforeDate(date: Date): Promise<ArchiveStats> {
    if (!this.cfg || !this.s3) {
      return {
        bucketsProcessed: 0,
        bucketsSkipped: 0,
        rowsArchived: 0,
        bytesUploaded: 0,
      };
    }

    // Group by tenant_id + day in PG. NB: DATE_TRUNC returns timestamp;
    // we cast to date for stable string format.
    const buckets: Array<{ tenantId: string; day: string }> = await this.auditRepo
      .createQueryBuilder('al')
      .select('al.tenant_id', 'tenantId')
      .addSelect("DATE_TRUNC('day', al.created_at)::date::text", 'day')
      .where('al.created_at < :cutoff', { cutoff: date })
      .groupBy('al.tenant_id')
      .addGroupBy("DATE_TRUNC('day', al.created_at)::date")
      .getRawMany();

    const stats: ArchiveStats = {
      bucketsProcessed: 0,
      bucketsSkipped: 0,
      rowsArchived: 0,
      bytesUploaded: 0,
    };

    for (const b of buckets) {
      try {
        const result = await this.archiveBucket(b.tenantId, b.day);
        if (result.skipped) {
          stats.bucketsSkipped += 1;
        } else {
          stats.bucketsProcessed += 1;
          stats.rowsArchived += result.rows;
          stats.bytesUploaded += result.bytes;
        }
      } catch (err) {
        this.logger.error(
          `Failed to archive bucket tenant=${b.tenantId} day=${b.day}: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
        // continue with next bucket — partial progress is fine
      }
    }

    return stats;
  }

  private async archiveBucket(
    tenantId: string,
    day: string,
  ): Promise<{ skipped: boolean; rows: number; bytes: number }> {
    const key = `audit-archive/${tenantId}/${day}.ndjson.gz`;

    // Idempotency: if object already exists in S3, just delete the rows
    // (they were already archived in a previous run that crashed before delete).
    const exists = await this.objectExists(key);
    if (exists) {
      this.logger.log(
        `Bucket already archived: ${key} — deleting DB rows without re-upload.`,
      );
      await this.deleteBucketRows(tenantId, day);
      return { skipped: true, rows: 0, bytes: 0 };
    }

    // Stream rows for this (tenant, day). Day window is [day, day+1).
    const dayStart = new Date(`${day}T00:00:00.000Z`);
    const dayEnd = new Date(dayStart.getTime() + 24 * 3600 * 1000);

    const rows = await this.auditRepo
      .createQueryBuilder('al')
      .where('al.tenant_id = :tenantId', { tenantId })
      .andWhere('al.created_at >= :dayStart', { dayStart })
      .andWhere('al.created_at < :dayEnd', { dayEnd })
      .orderBy('al.created_at', 'ASC')
      .getMany();

    if (rows.length === 0) {
      return { skipped: true, rows: 0, bytes: 0 };
    }

    const ndjson = rows.map((r) => JSON.stringify(r)).join('\n') + '\n';
    const gz = gzipSync(Buffer.from(ndjson, 'utf8'));

    await this.s3!.send(
      new PutObjectCommand({
        Bucket: this.cfg!.bucket,
        Key: key,
        Body: gz,
        ContentType: 'application/x-ndjson',
        ContentEncoding: 'gzip',
        Metadata: {
          'tenant-id': tenantId,
          day,
          'row-count': String(rows.length),
        },
      }),
    );

    // Delete archived rows by id list (safer than re-querying time window
    // which could race with concurrent inserts at day boundary).
    const ids = rows.map((r) => r.id);
    await this.auditRepo.delete(ids);

    this.logger.log(
      `Archived bucket ${key}: rows=${rows.length} bytes=${gz.length}`,
    );
    return { skipped: false, rows: rows.length, bytes: gz.length };
  }

  private async deleteBucketRows(tenantId: string, day: string): Promise<void> {
    const dayStart = new Date(`${day}T00:00:00.000Z`);
    const dayEnd = new Date(dayStart.getTime() + 24 * 3600 * 1000);
    await this.auditRepo
      .createQueryBuilder()
      .delete()
      .where('tenant_id = :tenantId', { tenantId })
      .andWhere('created_at >= :dayStart', { dayStart })
      .andWhere('created_at < :dayEnd', { dayEnd })
      .execute();
  }

  private async objectExists(key: string): Promise<boolean> {
    try {
      await this.s3!.send(
        new HeadObjectCommand({ Bucket: this.cfg!.bucket, Key: key }),
      );
      return true;
    } catch (err: unknown) {
      const e = err as { name?: string; $metadata?: { httpStatusCode?: number } };
      if (e?.name === 'NotFound' || e?.$metadata?.httpStatusCode === 404) {
        return false;
      }
      throw err;
    }
  }

  /**
   * Restore: fetch archived NDJSON for a (tenantId, day) and return parsed rows.
   * Used by admin restore endpoint.
   */
  async restoreBucket(tenantId: string, day: string): Promise<unknown[]> {
    if (!this.cfg || !this.s3) {
      throw new Error('Audit archive not configured');
    }
    const key = `audit-archive/${tenantId}/${day}.ndjson.gz`;
    const out = await this.s3.send(
      new GetObjectCommand({ Bucket: this.cfg.bucket, Key: key }),
    );
    const body = out.Body;
    if (!body) return [];
    const buf = await this.streamToBuffer(body as Readable);
    const text = gunzipSync(buf).toString('utf8');
    return text
      .split('\n')
      .filter((l) => l.length > 0)
      .map((l) => JSON.parse(l));
  }

  private async streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  // Hard delete with no archive — kept only for tests / explicit ops use.
  async deleteOlderThan(date: Date): Promise<void> {
    await this.auditRepo.delete({ createdAt: LessThan(date) });
  }
}
