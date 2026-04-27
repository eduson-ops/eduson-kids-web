import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsString, Length, Matches, IsOptional } from 'class-validator';
import { Throttle } from '@nestjs/throttler';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { Public } from '../../common/decorators/public.decorator';
import { RoomsService } from './rooms.service';
import { Classroom } from '../classroom/classroom.entity';
import { AuditService } from '../audit/audit.service';

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

class GuestRoomTokenDto {
  @IsString()
  @Length(1, 128)
  @Matches(/^[\w\-]+$/, { message: 'roomId may only contain letters, digits, - and _' })
  roomId!: string;

  @IsString()
  @Length(1, 64)
  displayName!: string;

  @IsString()
  @Length(4, 64)
  inviteCode!: string;
}

@ApiTags('rooms')
@Controller('rooms')
export class RoomsController {
  constructor(
    private readonly roomsService: RoomsService,
    @InjectRepository(Classroom) private readonly classroomRepo: Repository<Classroom>,
    private readonly auditService: AuditService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a video room (returns id + meetLink)' })
  createRoom(@Body() dto: CreateRoomDto, @CurrentUser() _user: JwtPayload) {
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
  @Throttle({ guest: { ttl: 60_000, limit: 5 } })
  @ApiOperation({ summary: 'Get LiveKit token for guests (requires inviteCode, rate-limited 5/min/IP, 1h TTL)' })
  async getGuestToken(@Body() dto: GuestRoomTokenDto, @Req() req: Request) {
    const classroom = await this.classroomRepo.findOne({
      where: { inviteCode: dto.inviteCode },
    });
    if (!classroom) {
      throw new NotFoundException('Classroom not found for given inviteCode');
    }

    const identity = `guest-${dto.displayName}-${Date.now().toString(36)}`;
    // Cap guest TTL to 1 hour (3600s)
    const token = await this.roomsService.generateToken(dto.roomId, identity, 3600);

    // Audit the guest token issuance for incident response
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? req.ip ?? '';
    const userAgent = (req.headers['user-agent'] as string) ?? '';
    try {
      await this.auditService.log({
        userId: null,
        action: 'rooms.guest_token.issued',
        resourceType: 'classroom',
        resourceId: classroom.id,
        ip,
        userAgent,
      });
    } catch {
      // Audit failures must not block a valid guest join
    }

    return { token, url: this.roomsService.getLivekitUrl() };
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get room info (stub for now)' })
  getRoom(@Param('id') id: string) {
    return { id, status: 'active', meetLink: `/room/${id}` };
  }
}
