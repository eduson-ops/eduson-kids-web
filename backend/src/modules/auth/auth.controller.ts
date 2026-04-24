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
  }

  @Public()
  @Post('child-code')
  @HttpCode(HttpStatus.OK)
  @Throttle({ login: { ttl: 900000, limit: 5 } })
  @ApiOperation({ summary: 'Child login via invite code (format: login:pin)' })
  async childCodeLogin(@Body() dto: ChildCodeDto) {
    return this.authService.loginChildByCode(dto.code, dto.name);
  }

  @Public()
  @Post('guest')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60000, limit: 20 } })
  @ApiOperation({ summary: 'Create a short-lived guest token (1h)' })
  async guestLogin() {
    return this.authService.loginGuest();
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
