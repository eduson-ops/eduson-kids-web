import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  Req,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { UserRole } from '../auth/entities/user.entity';

class ListUsersDto {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  pageSize?: number;

  @IsOptional()
  @IsString()
  search?: string;
}

class SetActiveDto {
  @IsBoolean()
  isActive!: boolean;
}

class SetRoleDto {
  @IsEnum(UserRole)
  role!: UserRole;
}

function extractAuditCtx(req: Request): { ip: string; userAgent: string } {
  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
    req.ip ??
    '';
  const userAgent = (req.headers['user-agent'] as string) ?? '';
  return { ip, userAgent };
}

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('users')
  @Roles('curator', 'school_admin', 'regional_admin', 'platform_admin')
  @ApiOperation({ summary: 'List users in active tenant (paginated)' })
  list(@Query() q: ListUsersDto) {
    return this.admin.listUsers(q);
  }

  @Patch('users/:id/active')
  @Roles('school_admin', 'regional_admin', 'platform_admin')
  @ApiOperation({ summary: 'Activate / deactivate a user (cannot affect higher role)' })
  setActive(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SetActiveDto,
    @CurrentUser() actor: JwtPayload,
    @Req() req: Request,
  ) {
    return this.admin.setUserActive(actor, id, dto.isActive, extractAuditCtx(req));
  }

  @Patch('users/:id/role')
  @Roles('platform_admin')
  @ApiOperation({ summary: 'Change a user role (platform admin only)' })
  setRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SetRoleDto,
    @CurrentUser() actor: JwtPayload,
    @Req() req: Request,
  ) {
    return this.admin.setUserRole(actor, id, dto.role, extractAuditCtx(req));
  }

  @Get('stats')
  @Roles('curator', 'school_admin', 'regional_admin', 'platform_admin')
  @ApiOperation({ summary: 'Tenant-wide statistics summary' })
  stats() {
    return this.admin.getTenantStats();
  }
}
