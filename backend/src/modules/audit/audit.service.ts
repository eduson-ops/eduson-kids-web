import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit.entity';

/**
 * Audit log writer + reader.
 *
 * D2-16: Cleanup/archival of old logs is now owned by `AuditArchivalService`
 * (separate cron, S3 archive before delete) for 152-ФЗ compliance.
 */

interface AuditLogEntry {
  userId: string | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  ip: string;
  userAgent: string;
  payload?: Record<string, unknown> | null;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditRepo: Repository<AuditLog>,
  ) {}

  async log(entry: AuditLogEntry): Promise<void> {
    const log = this.auditRepo.create({
      ...entry,
      payload: entry.payload ?? null,
    });
    await this.auditRepo.save(log);
  }

  async findAll(filter: {
    userId?: string;
    action?: string;
    fromDate?: Date;
    toDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    const qb = this.auditRepo.createQueryBuilder('al');

    if (filter.userId) qb.andWhere('al.userId = :userId', { userId: filter.userId });
    if (filter.action) qb.andWhere('al.action ILIKE :action', { action: `%${filter.action}%` });
    if (filter.fromDate) qb.andWhere('al.createdAt >= :fromDate', { fromDate: filter.fromDate });
    if (filter.toDate) qb.andWhere('al.createdAt <= :toDate', { toDate: filter.toDate });

    return qb
      .orderBy('al.createdAt', 'DESC')
      .skip(filter.offset ?? 0)
      .take(Math.min(filter.limit ?? 50, 200))
      .getManyAndCount();
  }
}
