import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsString, Length, Matches, IsOptional } from 'class-validator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { Public } from '../../common/decorators/public.decorator';
import { RoomsService } from './rooms.service';

class CreateRoomDto {
  @IsString()
  @IsOptional()
  classroomId?: string;

  @IsString()
  @IsOptional()
  @Length(1, 128)
  name?: string;
}

class RoomTokenDto {
  @IsString()
  @Length(1, 128)
  @Matches(/^[\w\-]+$/, { message: 'roomId may only contain letters, digits, - and _' })
  roomId!: string;

  @IsString()
  @Length(1, 64)
  displayName!: string;
}

@ApiTags('rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a video room (returns id + meetLink)' })
  createRoom(@Body() dto: CreateRoomDto, @CurrentUser() user: JwtPayload) {
    const id = require('crypto').randomBytes(6).toString('hex') as string;
    const name = dto.name ?? (dto.classroomId ? `class-${dto.classroomId.slice(0, 6)}` : `room-${id}`);
    const roomId = `${name.toLowerCase().replace(/\s+/g, '-')}-${id}`;
    return { id: roomId, meetLink: `/room/${roomId}` };
  }

  @Post('token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get LiveKit token for a room (authenticated users only)' })
  async getToken(@Body() dto: RoomTokenDto, @CurrentUser() user: JwtPayload) {
    const identity = `${dto.displayName}-${user.sub.slice(0, 8)}`;
    const token = await this.roomsService.generateToken(dto.roomId, identity);
    return { token, url: this.roomsService.getLivekitUrl() };
  }

  @Post('token/guest')
  @Public()
  @ApiOperation({ summary: 'Get LiveKit token for guests (no auth required, rate-limited)' })
  async getGuestToken(@Body() dto: RoomTokenDto) {
    const identity = `guest-${dto.displayName}-${Date.now().toString(36)}`;
    const token = await this.roomsService.generateToken(dto.roomId, identity, 3600);
    return { token, url: this.roomsService.getLivekitUrl() };
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get room info (stub for now)' })
  getRoom(@Param('id') id: string) {
    return { id, status: 'active', meetLink: `/room/${id}` };
  }
}
