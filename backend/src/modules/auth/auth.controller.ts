import {
  Controller,
  Post,
  Put,
  Get,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, Length, IsOptional, IsObject } from 'class-validator';
import { AuthService, AvatarData } from './auth.service';
import { ChildLoginDto } from './dto/child-login.dto';
import { ParentLoginDto } from './dto/parent-login.dto';
import { TeacherLoginDto } from './dto/teacher-login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtPayload } from './strategies/jwt.strategy';

class ChildCodeDto {
  @IsString()
  @Length(1, 128)
  code!: string;

  @IsString()
  @IsOptional()
  name?: string;
}

class UpdateAvatarDto {
  @IsObject()
  avatar!: AvatarData;
}

const REFRESH_COOKIE = 'refresh_token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env['NODE_ENV'] === 'production',
  sameSite: 'strict' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000,
  path: '/api/v1/auth/refresh',
};

/**
 * F-12 — HttpOnly cookie that mirrors the JWT access token returned in body.
 * SameSite=lax (not strict) so that top-level navigations after VK ID OAuth
 * redirect back to the SPA still carry the cookie. maxAge mirrors the JWT
 * accessTtlSec config (default 15 min) — kept generous (24h cap) so a
 * slow-clock device never sees a still-valid JWT rejected by the cookie age.
 * The JWT itself enforces real expiration; the cookie just holds the bytes.
 */
const ACCESS_COOKIE = 'access_token';
const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env['NODE_ENV'] === 'production',
  sameSite: 'lax' as const,
  maxAge: 24 * 60 * 60 * 1000,
  path: '/',
};

// F-12 feature flag — opt-out switch in case the cookie path causes any
// surprise on the demo day. Defaults ON because backwards compat is preserved
// (Authorization header still works), but flipping to "false" disables both
// setting and reading the access_token cookie at the controller layer.
const cookieAuthEnabled = (): boolean => process.env['USE_COOKIE_AUTH'] !== 'false';

function setAccessCookie(res: Response, accessToken: string): void {
  if (!cookieAuthEnabled()) return;
  res.cookie(ACCESS_COOKIE, accessToken, ACCESS_COOKIE_OPTIONS);
}

function clearAccessCookie(res: Response): void {
  res.clearCookie(ACCESS_COOKIE, { path: ACCESS_COOKIE_OPTIONS.path });
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('child/login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ login: { ttl: 900000, limit: 5 } })
  @ApiOperation({ summary: 'Child login with 6-digit PIN' })
  async childLogin(
    @Body() dto: ChildLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? req.ip ?? '';
    const tokens = await this.authService.loginChild(dto, ip);
    res.cookie(REFRESH_COOKIE, tokens.refreshToken, COOKIE_OPTIONS);
    setAccessCookie(res, tokens.accessToken);
    return { accessToken: tokens.accessToken };
  }

  @Public()
  @Post('parent/login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ login: { ttl: 900000, limit: 5 } })
  @ApiOperation({ summary: 'Parent login with email/password' })
  async parentLogin(
    @Body() dto: ParentLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? req.ip ?? '';
    const tokens = await this.authService.loginParent(dto, ip);
    res.cookie(REFRESH_COOKIE, tokens.refreshToken, COOKIE_OPTIONS);
    setAccessCookie(res, tokens.accessToken);
    return { accessToken: tokens.accessToken };
  }

  @Public()
  @Post('teacher/login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ login: { ttl: 900000, limit: 5 } })
  @ApiOperation({ summary: 'Teacher login with email/password + school code' })
  async teacherLogin(
    @Body() dto: TeacherLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? req.ip ?? '';
    const tokens = await this.authService.loginTeacher(dto, ip);
    res.cookie(REFRESH_COOKIE, tokens.refreshToken, COOKIE_OPTIONS);
    setAccessCookie(res, tokens.accessToken);
    return { accessToken: tokens.accessToken };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate refresh token' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = (req.cookies as Record<string, string>)?.[REFRESH_COOKIE];
    if (!refreshToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ error: 'No refresh token' });
    }
    const tokens = await this.authService.refresh(refreshToken);
    res.cookie(REFRESH_COOKIE, tokens.refreshToken, COOKIE_OPTIONS);
    setAccessCookie(res, tokens.accessToken);
    return { accessToken: tokens.accessToken };
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = (req.cookies as Record<string, string>)?.[REFRESH_COOKIE];
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }
    res.clearCookie(REFRESH_COOKIE, { path: COOKIE_OPTIONS.path });
    clearAccessCookie(res);
  }

  @Public()
  @Post('child-code')
  @HttpCode(HttpStatus.OK)
  @Throttle({ login: { ttl: 900000, limit: 5 } })
  @ApiOperation({ summary: 'Child login via invite code (format: login:pin)' })
  async childCodeLogin(
    @Body() dto: ChildCodeDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? req.ip ?? '';
    const tokens = await this.authService.loginChildByCode(dto.code, ip, dto.name);
    res.cookie(REFRESH_COOKIE, tokens.refreshToken, COOKIE_OPTIONS);
    setAccessCookie(res, tokens.accessToken);
    return tokens;
  }

  @Public()
  @Post('guest')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60000, limit: 20 } })
  @ApiOperation({ summary: 'Create a short-lived guest token (1h)' })
  async guestLogin(@Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.loginGuest();
    setAccessCookie(res, tokens.accessToken);
    return tokens;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async me(@CurrentUser() user: JwtPayload) {
    return this.authService.getMe(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Put('avatar')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update avatar (stored encrypted in profile)' })
  async updateAvatar(@Body() dto: UpdateAvatarDto, @CurrentUser() user: JwtPayload) {
    await this.authService.updateAvatar(user.sub, dto.avatar);
  }
}
