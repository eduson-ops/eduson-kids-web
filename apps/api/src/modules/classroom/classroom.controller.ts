import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional, IsArray, IsNumber, Min, Max, Length, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ClassroomService } from './classroom.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

class CreateClassroomDto {
  @IsString()
  @Length(2, 128)
  name!: string;
}

class AddStudentsDto {
  @IsInt()
  @Min(1)
  @Max(40)
  count!: number;

  @IsString()
  @Length(2, 32)
  namePrefix!: string;
}

class BulkStudentItem {
  @IsString()
  firstName!: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsNumber()
  birthYear?: number;
}

class BulkCreateDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkStudentItem)
  students!: BulkStudentItem[];
}

class TransferStudentDto {
  @IsString()
  studentId!: string;

  @IsString()
  toClassroomId!: string;
}

@ApiTags('classrooms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('classrooms')
export class ClassroomController {
  constructor(private readonly classroomService: ClassroomService) {}

  @Get()
  @Roles('teacher', 'methodist', 'curator', 'school_admin', 'regional_admin', 'platform_admin', 'admin')
  list(@CurrentUser() user: JwtPayload) {
    return this.classroomService.list(user.sub, user.role);
  }

  @Post()
  @Roles('teacher', 'methodist', 'curator', 'school_admin', 'regional_admin', 'platform_admin', 'admin')
  create(@Body() dto: CreateClassroomDto, @CurrentUser() user: JwtPayload) {
    return this.classroomService.create(user.sub, dto.name);
  }

  @Get(':id')
  @Roles('teacher')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.classroomService.findById(id);
  }

  @Patch(':id')
  @Roles('teacher')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateClassroomDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.classroomService.update(id, user.sub, dto.name);
  }

  @Delete(':id')
  @Roles('teacher')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.classroomService.delete(id, user.sub);
  }

  @Get(':id/students')
  @Roles('teacher', 'methodist', 'curator', 'school_admin', 'regional_admin', 'platform_admin', 'admin')
  getStudents(@Param('id', ParseUUIDPipe) id: string) {
    return this.classroomService.getStudents(id);
  }

  @Post(':id/students')
  @Roles('teacher', 'methodist', 'curator', 'school_admin', 'regional_admin', 'platform_admin', 'admin')
  addStudents(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddStudentsDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.classroomService.addStudents(id, user.sub, dto.count, dto.namePrefix);
  }

  @Post(':id/students/bulk')
  @Roles('teacher', 'methodist', 'curator', 'school_admin', 'regional_admin', 'platform_admin', 'admin')
  bulkCreateStudents(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: BulkCreateDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.classroomService.bulkCreateStudents(id, user.sub, dto.students);
  }

  @Post(':id/transfer')
  @Roles('teacher', 'methodist', 'curator', 'school_admin', 'regional_admin', 'platform_admin', 'admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async transferStudent(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TransferStudentDto,
  ) {
    await this.classroomService.transferStudent(id, dto.studentId, dto.toClassroomId);
  }
}
