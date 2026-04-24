import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Classroom } from './classroom.entity';
import { ClassroomController } from './classroom.controller';
import { ClassroomService } from './classroom.service';
import { StudentRosterService } from './student-roster.service';
import { PdfRosterService } from './pdf-roster.service';
import { AuthModule } from '../auth/auth.module';
import { User } from '../auth/entities/user.entity';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Classroom, User]),
    AuthModule,
    TenantsModule,
  ],
  controllers: [ClassroomController],
  providers: [ClassroomService, StudentRosterService, PdfRosterService],
  exports: [ClassroomService, StudentRosterService, PdfRosterService],
})
export class ClassroomModule {}
