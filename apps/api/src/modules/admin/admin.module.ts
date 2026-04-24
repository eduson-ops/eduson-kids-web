import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Classroom } from '../classroom/classroom.entity';
import { User } from '../auth/entities/user.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Classroom, User])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
