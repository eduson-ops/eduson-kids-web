import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  Res,
  HttpStatus,
  HttpCode,
  ServiceUnavailableException,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
import { Public } from '../../common/decorators/public.decorator';
import { AnonymousAllowed } from '../../common/tenancy/tenant.guard';
import { VkIdService } from './strategies/vk-id.service';
import { SferumLinkService } from './strategies/sferum-link.service';

const REFRESH_COOKIE = 'refresh_token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env['NODE_ENV'] === 'production',
  sameSite: 'lax' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000,
  path: '/api/v1/auth/refresh',
};

const PKCE_VERIFIER_COOKIE = 'vk_pkce';
const PKCE_STATE_COOKIE = 'vk_state';

class JoinClassDto {
  @IsString()
  @Length(6, 32)
  classCode!: string;

  @IsString()
  @Length(1, 32)
  displayName!: string;
}

@ApiTags('auth-external')
@Controller('auth')
export class ExternalAuthController {
  constructor(
    private readonly vk: VkIdService,
    private readonly sferum: SferumLinkService,
  ) {}

  // ===== VK ID =====

  @Public()
  @AnonymousAllowed()
  @Get('vk/init')
  @ApiOperation({ summary: 'Begin VK ID OAuth flow (returns auth URL + sets PKCE cookies)' })
  vkInit(@Query('returnTo') returnTo: string | undefined, @Res({ passthrough: true }) res: Response) {
    if (!this.vk.isEnabled()) {
      throw new ServiceUnavailableException('VK ID not configured on this server');
    }
    const { url, state, codeVerifier } = this.vk.buildInitUrl(returnTo);
    res.cookie(PKCE_STATE_COOKIE, state, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 600_000,
      secure: process.env['NODE_ENV'] === 'production',
      path: '/api/v1/auth/vk',
    });
    res.cookie(PKCE_VERIFIER_COOKIE, codeVerifier, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 600_000,
      secure: process.env['NODE_ENV'] === 'production',
      path: '/api/v1/auth/vk',
    });
    return { url };
  }

  @Public()
  @AnonymousAllowed()
  @Get('vk/callback')
  @ApiOperation({ summary: 'VK ID OAuth callback' })
  async vkCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!code || !state) throw new BadRequestException('Missing code or state');
    const expectedState = (req.cookies as Record<string, string>)?.[PKCE_STATE_COOKIE];
    const codeVerifier = (req.cookies as Record<string, string>)?.[PKCE_VERIFIER_COOKIE];
    if (!expectedState || !codeVerifier) {
      throw new BadRequestException('Missing PKCE cookies — initiate flow again');
    }
    const result = await this.vk.handleCallback(code, state, expectedState, codeVerifier);

    res.cookie(REFRESH_COOKIE, result.refreshToken, COOKIE_OPTIONS);
    res.clearCookie(PKCE_STATE_COOKIE, { path: '/api/v1/auth/vk' });
    res.clearCookie(PKCE_VERIFIER_COOKIE, { path: '/api/v1/auth/vk' });

    // If returnTo was passed in state, suggest a redirect target
    const returnTo = state.includes('|') ? decodeURIComponent(state.split('|')[1]) : '/';
    return {
      accessToken: result.accessToken,
      isNewUser: result.isNewUser,
      redirectTo: returnTo,
    };
  }

  // ===== Sferum deep-link =====

  @Public()
  @AnonymousAllowed()
  @Get('sferum/resolve')
  @ApiOperation({ summary: 'Look up classroom info by Sferum invite code' })
  async sferumResolve(@Query('classCode') classCode: string) {
    if (!classCode) throw new BadRequestException('classCode required');
    const c = await this.sferum.resolveClassCode(classCode);
    if (!c) {
      return { ok: false, reason: 'Класс не найден или код устарел' };
    }
    return {
      ok: true,
      classroom: { id: c.id, name: c.name, metadata: c.metadata },
      tenantId: c.tenantId,
    };
  }

  @Public()
  @AnonymousAllowed()
  @Post('sferum/join')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Quick-join classroom from Sferum deep-link as new child' })
  async sferumJoin(@Body() dto: JoinClassDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.sferum.quickJoinAsChild(dto.classCode, dto.displayName);
    res.cookie(REFRESH_COOKIE, result.refreshToken, COOKIE_OPTIONS);
    return {
      accessToken: result.accessToken,
      classroomId: result.classroomId,
      tenantId: result.tenantId,
      user: result.user,
    };
  }
}
