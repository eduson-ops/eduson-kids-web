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
import { IsString, IsInt, Min, Max, Length } from 'class-validator';
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

@ApiTags('classrooms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('classrooms')
export class ClassroomController {
  constructor(private readonly classroomService: ClassroomService) {}

  @Post()
  @Roles('teacher')
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

  @Post(':id/students')
  @Roles('teacher')
  addStudents(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddStudentsDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.classroomService.addStudents(id, user.sub, dto.count, dto.namePrefix);
  }
}
