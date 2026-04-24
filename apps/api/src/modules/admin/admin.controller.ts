import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsUUID, Length } from 'class-validator';
import { AdminService } from './admin.service';
import { Classroom } from '../classroom/classroom.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

class CreateClassroomDto {
  @IsString()
  @Length(2, 128)
  name!: string;

  @IsString()
  teacherId!: string;
}

class AssignTeacherDto {
  @IsString()
  teacherId!: string;
}

class TransferStudentDto {
  @IsString()
  studentLogin!: string;

  @IsUUID()
  toClassroomId!: string;
}

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('teacher', 'admin')
@Controller('api/v1/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('classrooms')
  listClassrooms(): Promise<Classroom[]> {
    return this.adminService.listClassrooms();
  }

  @Post('classrooms')
  createClassroom(@Body() dto: CreateClassroomDto): Promise<Classroom> {
    return this.adminService.createClassroom(dto.name, dto.teacherId);
  }

  @Delete('classrooms/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteClassroom(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.adminService.deleteClassroom(id);
  }

  @Patch('classrooms/:id/teacher')
  assignTeacher(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignTeacherDto,
  ): Promise<Classroom> {
    return this.adminService.assignTeacher(id, dto.teacherId);
  }

  @Post('classrooms/:id/students/transfer')
  async transferStudent(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TransferStudentDto,
  ): Promise<{ ok: boolean }> {
    await this.adminService.transferStudent(id, dto.studentLogin, dto.toClassroomId);
    return { ok: true };
  }
}
