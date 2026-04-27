import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgressEvent } from './progress.entity';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { AuthModule } from '../auth/auth.module';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProgressEvent, User]), AuthModule],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}
