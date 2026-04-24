import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  ParseUUIDPipe,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsIn } from 'class-validator';
import { RoomService } from './room.service';
import { Room, RoomStatus } from './room.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { Public } from '../../common/decorators/public.decorator';

class CreateRoomDto {
  @IsOptional()
  @IsUUID()
  classroomId?: string;
}

class UpdateRoomStatusDto {
  @IsIn(['waiting', 'active', 'ended'])
  status!: RoomStatus;
}

interface CreateRoomResponse {
  id: string;
  meetLink: string;
}

@ApiTags('rooms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  async create(
    @Body() dto: CreateRoomDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<CreateRoomResponse> {
    const room = await this.roomService.create(user.sub, dto.classroomId);
    return { id: room.id, meetLink: room.meetLink };
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Room> {
    const room = await this.roomService.findOne(id);

    if (!room) {
      throw new NotFoundException(`Room ${id} not found`);
    }

    return room;
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoomStatusDto,
  ): Promise<{ ok: boolean }> {
    await this.roomService.updateStatus(id, dto.status);
    return { ok: true };
  }
}
