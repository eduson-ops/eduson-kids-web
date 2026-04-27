import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuditArchivalService } from '../src/modules/audit/audit-archival.service';
import { AuditLog } from '../src/modules/audit/audit.entity';
import { gunzipSync } from 'zlib';

/**
 * D2-16: Unit tests for audit log archival.
 *
 * Mocks: S3Client send() at instance level, plus the AuditLog repository.
 * Real PG-grouping logic isn't exercised here (lives in integration tests
 * with a real Postgres) — we verify orchestration: S3 upload → DB delete,
 * skip-on-existing, graceful skip when env unconfigured.
 */
describe('AuditArchivalService', () => {
  function buildModule(envOverrides: Record<string, string | undefined>) {
    return async (rows: Array<Partial<AuditLog>>) => {
      const repoMock = {
        createQueryBuilder: jest.fn(),
        delete: jest.fn().mockResolvedValue(undefined),
      };
      const config = {
        get: (k: string) => envOverrides[k],
      };
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AuditArchivalService,
          { provide: ConfigService, useValue: config },
          { provide: getRepositoryToken(AuditLog), useValue: repoMock },
        ],
      }).compile();
      const svc = module.get(AuditArchivalService);

      const buckets = [
        { tenantId: 't1', day: '2024-01-15' },
      ];
      const groupQb = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        addGroupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(buckets),
      };
      // After call 1 (grouping), each subsequent createQueryBuilder() may be
      // either a fetch (archiveBucket happy path) or a delete (idempotent
      // skip path). Return a polymorphic QB that supports both shapes — the
      // service only calls the methods relevant to its branch.
      const polyQb: Record<string, unknown> = {};
      polyQb.where = jest.fn(() => polyQb);
      polyQb.andWhere = jest.fn(() => polyQb);
      polyQb.orderBy = jest.fn(() => polyQb);
      polyQb.getMany = jest.fn().mockResolvedValue(rows);
      polyQb.delete = jest.fn(() => polyQb);
      polyQb.execute = jest.fn().mockResolvedValue(undefined);
      let qbCall = 0;
      repoMock.createQueryBuilder.mockImplementation(() => {
        qbCall += 1;
        if (qbCall === 1) return groupQb;
        return polyQb;
      });

      return { svc, repoMock };
    };
  }

  it('skips archival when env unconfigured (DB-only mode)', async () => {
    const make = buildModule({});
    const { svc, repoMock } = await make([]);
    expect(svc.isConfigured()).toBe(false);
    const stats = await svc.archiveBeforeDate(new Date());
    expect(stats.rowsArchived).toBe(0);
    expect(stats.bucketsProcessed).toBe(0);
    expect(repoMock.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('runDailyArchive is a no-op without env vars', async () => {
    const make = buildModule({});
    const { svc } = await make([]);
    // Should not throw, should not invoke any S3.
    await expect(svc.runDailyArchive()).resolves.toBeUndefined();
  });

  it('uploads NDJSON.gz then deletes rows when configured', async () => {
    const make = buildModule({
      AUDIT_ARCHIVE_BUCKET: 'kubik-audit-archive',
      AUDIT_ARCHIVE_ACCESS_KEY_ID: 'k',
      AUDIT_ARCHIVE_SECRET_ACCESS_KEY: 's',
    });
    const sampleRows: Array<Partial<AuditLog>> = [
      {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        tenantId: 't1',
        userId: null,
        action: 'login',
        resourceType: 'auth',
        resourceId: null,
        ip: '127.0.0.1',
        userAgent: 'jest',
        payload: null,
        createdAt: new Date('2024-01-15T10:00:00Z'),
      },
    ];
    const { svc, repoMock } = await make(sampleRows);
    expect(svc.isConfigured()).toBe(true);

    // Mock S3 send: HEAD → 404, PUT → ok
    const sendMock = jest.fn(async (cmd: { constructor: { name: string } }) => {
      const name = cmd.constructor.name;
      if (name === 'HeadObjectCommand') {
        const err = Object.assign(new Error('not found'), {
          name: 'NotFound',
          $metadata: { httpStatusCode: 404 },
        });
        throw err;
      }
      if (name === 'PutObjectCommand') {
        return { $metadata: { httpStatusCode: 200 } };
      }
      return {};
    });
    // Hack into private s3 client
    (svc as unknown as { s3: { send: typeof sendMock } }).s3 = { send: sendMock };

    const stats = await svc.archiveBeforeDate(new Date('2024-04-01'));
    expect(stats.bucketsProcessed).toBe(1);
    expect(stats.rowsArchived).toBe(1);
    expect(stats.bytesUploaded).toBeGreaterThan(0);

    // Inspect the uploaded body — it should gunzip back to our row.
    const putCalls = sendMock.mock.calls.filter(
      (c) => (c[0] as { constructor: { name: string } }).constructor.name === 'PutObjectCommand',
    );
    expect(putCalls).toHaveLength(1);
    const cmd = putCalls[0][0] as unknown as {
      input: { Body: Buffer; Key: string; Bucket: string };
    };
    expect(cmd.input.Bucket).toBe('kubik-audit-archive');
    expect(cmd.input.Key).toBe('audit-archive/t1/2024-01-15.ndjson.gz');
    const decoded = gunzipSync(cmd.input.Body).toString('utf8');
    expect(decoded).toContain('"action":"login"');
    expect(decoded.endsWith('\n')).toBe(true);

    // And rows should have been deleted by id
    expect(repoMock.delete).toHaveBeenCalledWith([
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    ]);
  });

  it('skips upload when archive object already exists (idempotent)', async () => {
    const make = buildModule({
      AUDIT_ARCHIVE_BUCKET: 'kubik-audit-archive',
      AUDIT_ARCHIVE_ACCESS_KEY_ID: 'k',
      AUDIT_ARCHIVE_SECRET_ACCESS_KEY: 's',
    });
    const { svc } = await make([]);

    const sendMock = jest.fn(async (cmd: { constructor: { name: string } }) => {
      const name = cmd.constructor.name;
      if (name === 'HeadObjectCommand') {
        return { $metadata: { httpStatusCode: 200 } };
      }
      if (name === 'PutObjectCommand') {
        throw new Error('should not upload — bucket already archived');
      }
      return {};
    });
    (svc as unknown as { s3: { send: typeof sendMock } }).s3 = { send: sendMock };

    const stats = await svc.archiveBeforeDate(new Date('2024-04-01'));
    expect(stats.bucketsSkipped).toBe(1);
    expect(stats.bucketsProcessed).toBe(0);
    expect(stats.rowsArchived).toBe(0);
    // No PutObject calls
    const putCalls = sendMock.mock.calls.filter(
      (c) => (c[0] as { constructor: { name: string } }).constructor.name === 'PutObjectCommand',
    );
    expect(putCalls).toHaveLength(0);
  });
});
