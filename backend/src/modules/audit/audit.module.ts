import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AuditLog } from './audit.entity';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { AuditArchivalService } from './audit-archival.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog]),
    ScheduleModule.forRoot(),
    AuthModule,
  ],
  controllers: [AuditController],
  providers: [AuditService, AuditArchivalService],
  exports: [AuditService, AuditArchivalService],
})
export class AuditModule {}
