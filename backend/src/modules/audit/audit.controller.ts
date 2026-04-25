import {
  Controller,
  Get,
  Query,
  UseGuards,
  ServiceUnavailableException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsInt, Min, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { AuditService } from './audit.service';
import { AuditArchivalService } from './audit-archival.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

class AuditQueryDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  offset?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number;
}

class AuditRestoreDto {
  @IsString()
  tenantId!: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be YYYY-MM-DD' })
  date!: string;
}

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/audit')
export class AuditController {
  constructor(
    private readonly auditService: AuditService,
    private readonly archivalService: AuditArchivalService,
  ) {}

  @Get()
  @Roles('teacher')
  async findAll(@Query() query: AuditQueryDto) {
    const [items, total] = await this.auditService.findAll({
      userId: query.userId,
      action: query.action,
      fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
      toDate: query.toDate ? new Date(query.toDate) : undefined,
      offset: query.offset,
      limit: query.limit,
    });

    return { items, total };
  }

  /**
   * D2-16: Restore an archived audit-log day from YC Object Storage.
   * Admin-only — used to honour 152-ФЗ regulator requests for ≥1y old logs.
   */
  @Get('restore')
  @Roles('platform_admin')
  async restore(@Query() query: AuditRestoreDto) {
    if (!this.archivalService.isConfigured()) {
      throw new ServiceUnavailableException(
        'Audit archive is not configured (set AUDIT_ARCHIVE_BUCKET + credentials).',
      );
    }
    try {
      const items = await this.archivalService.restoreBucket(
        query.tenantId,
        query.date,
      );
      return { tenantId: query.tenantId, date: query.date, count: items.length, items };
    } catch (err) {
      const e = err as { name?: string; $metadata?: { httpStatusCode?: number } };
      if (e?.name === 'NoSuchKey' || e?.$metadata?.httpStatusCode === 404) {
        throw new BadRequestException(
          `No archived audit log for tenant=${query.tenantId} date=${query.date}`,
        );
      }
      throw err;
    }
  }
}
