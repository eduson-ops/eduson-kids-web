import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsOptional,
  IsInt,
  IsEnum,
  Min,
  Max,
  IsISO8601,
} from 'class-validator';
import { ScheduleService, CreateSlotDto } from './schedule.service';
import { SlotStatus, SlotType } from './schedule-slot.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

class CreateSlotBody implements CreateSlotDto {
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @IsOptional()
  @IsUUID()
  classroomId?: string;

  @IsISO8601()
  datetime!: string;

  teacherId!: string;

  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(180)
  durationMin?: number;

  @IsOptional()
  @IsEnum(SlotType)
  type?: SlotType;

  @IsOptional()
  @IsString()
  zoomLink?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

class UpdateStatusBody {
  @IsEnum(SlotStatus)
  status!: SlotStatus;

  @IsOptional()
  @IsUUID()
  rescheduledTo?: string;
}

class PatchSlotBody {
  @IsOptional()
  @IsISO8601()
  datetime?: string;

  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(180)
  durationMin?: number;

  @IsOptional()
  @IsString()
  zoomLink?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsUUID()
  studentId?: string;
}

@ApiTags('schedule')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/schedule')
export class ScheduleController {
  constructor(private readonly service: ScheduleService) {}

  @Post('slots')
  @Roles('teacher', 'admin', 'platform_admin', 'school_admin', 'curator')
  create(@Body() dto: CreateSlotBody, @CurrentUser() user: JwtPayload) {
    return this.service.create({ ...dto, teacherId: user.sub });
  }

  @Get('my')
  @Roles('child', 'teacher', 'admin', 'platform_admin', 'school_admin', 'curator')
  getMySlots(@CurrentUser() user: JwtPayload) {
    return this.service.getMySlots(user.sub, user.role);
  }

  @Get('classroom/:id')
  @Roles('teacher', 'admin', 'platform_admin', 'school_admin', 'curator')
  getClassroomSlots(@Param('id', ParseUUIDPipe) classroomId: string) {
    return this.service.getClassroomSlots(classroomId);
  }

  @Get('admin')
  @Roles('admin', 'platform_admin', 'school_admin', 'curator')
  getAllSlots(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.service.getAllSlots(
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
  }

  @Patch('slots/:id/status')
  @Roles('teacher', 'admin', 'platform_admin', 'school_admin', 'curator')
  updateStatus(
    @Param('id', ParseUUIDPipe) slotId: string,
    @Body() dto: UpdateStatusBody,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.updateStatus(slotId, user.sub, user.role, dto.status, dto.rescheduledTo);
  }

  @Patch('slots/:id')
  @Roles('teacher', 'admin', 'platform_admin', 'school_admin', 'curator')
  updateSlot(
    @Param('id', ParseUUIDPipe) slotId: string,
    @Body() dto: PatchSlotBody,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.service.updateSlot(slotId, user.sub, user.role, dto);
  }
}
