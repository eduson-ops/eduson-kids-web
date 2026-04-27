import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes, createHash } from 'node:crypto';
import { User, UserRole } from '../entities/user.entity';
import { TenantContext } from '../../../common/tenancy/tenant.context';
import { PiiCryptoService } from '../../../common/crypto/pii-crypto.service';
import { AuthService } from '../auth.service';

/**
 * VK ID (id.vk.com) OAuth 2.0 / OIDC integration.
 *
 * Flow (PKCE):
 *   1. Client GET /auth/vk/init → server returns { redirectUrl, state, codeVerifier }
 *      (codeVerifier stored in HttpOnly cookie or returned for client storage)
 *   2. User authorizes at VK ID
 *   3. VK redirects to /auth/vk/callback?code=...&state=...
 *   4. Server exchanges code for access_token using PKCE verifier
 *   5. Server fetches user profile from VK API (GET https://api.vk.com/method/users.get)
 *   6. Server matches external_ids.vk OR creates new user (with parent role
 *      since VK requires age 14+)
 *   7. Server issues KubiK JWT access_token + sets refresh cookie
 *
 * Env required (all optional — flow is gracefully disabled if missing):
 *   VK_ID_CLIENT_ID
 *   VK_ID_CLIENT_SECRET (a.k.a. service token)
 *   VK_ID_REDIRECT_URI (e.g. https://kubik.school/auth/vk/callback)
 *
 * If env not configured → flow returns 503 with explanatory body. This lets
 * the front-end conditionally hide the "Войти через ВК" button.
 */

const VK_AUTH_URL = 'https://id.vk.com/authorize';
const VK_TOKEN_URL = 'https://id.vk.com/oauth2/auth';
const VK_USERINFO_URL = 'https://id.vk.com/oauth2/user_info';

interface VkConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

interface VkTokenResponse {
  access_token: string;
  expires_in: number;
  user_id: number;
  refresh_token?: string;
  state?: string;
  scope?: string;
  token_type?: string;
  id_token?: string;
}

interface VkUserInfoResponse {
  user: {
    user_id: string;
    first_name: string;
    last_name: string;
    phone?: string;
    avatar?: string;
    email?: string;
    birthday?: string;
  };
}

@Injectable()
export class VkIdService {
  private readonly logger = new Logger(VkIdService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly config: ConfigService,
    private readonly authService: AuthService,
    private readonly tenantContext: TenantContext,
    private readonly pii: PiiCryptoService,
  ) {}

  isEnabled(): boolean {
    return Boolean(this.getConfig());
  }

  /**
   * Build authorization URL with PKCE. Client should redirect user there.
   */
  buildInitUrl(returnTo?: string): {
    url: string;
    state: string;
    codeVerifier: string;
  } {
    const cfg = this.requireConfig();
    const state = randomBytes(16).toString('base64url');
    const codeVerifier = randomBytes(32).toString('base64url');
    const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url');

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: cfg.clientId,
      redirect_uri: cfg.redirectUri,
      scope: 'email phone',
      state: returnTo ? `${state}|${encodeURIComponent(returnTo)}` : state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    return {
      url: `${VK_AUTH_URL}?${params.toString()}`,
      state,
      codeVerifier,
    };
  }

  /**
   * Exchange authorization code for tokens, fetch user info, and link to or
   * create a KubiK account in the active tenant.
   *
   * Returns issued access_token + refresh cookie value.
   */
  async handleCallback(
    code: string,
    state: string,
    expectedState: string,
    codeVerifier: string,
  ): Promise<{ accessToken: string; refreshToken: string; isNewUser: boolean }> {
    if (!state || state.split('|')[0] !== expectedState) {
      throw new BadRequestException('Invalid state — possible CSRF');
    }
    const cfg = this.requireConfig();

    // 1. Token exchange
    const tokenResp = await fetch(VK_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: cfg.clientId,
        client_secret: cfg.clientSecret,
        redirect_uri: cfg.redirectUri,
        code_verifier: codeVerifier,
      }),
    });
    if (!tokenResp.ok) {
      const body = await tokenResp.text();
      this.logger.warn(`VK token exchange failed: ${tokenResp.status} ${body}`);
      throw new UnauthorizedException('VK ID token exchange failed');
    }
    const tokens = (await tokenResp.json()) as VkTokenResponse;

    // 2. User info
    const userResp = await fetch(VK_USERINFO_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        access_token: tokens.access_token,
        client_id: cfg.clientId,
      }),
    });
    if (!userResp.ok) {
      throw new UnauthorizedException('VK userinfo fetch failed');
    }
    const userInfo = (await userResp.json()) as VkUserInfoResponse;
    const vkId = String(userInfo.user.user_id);

    // 3. Find or create
    const ctx = this.tenantContext.require();
    const isNewUser = !(await this.findByVkId(vkId, ctx.tenantId));
    const user = isNewUser
      ? await this.createUserFromVk(vkId, userInfo, ctx.tenantId)
      : (await this.findByVkId(vkId, ctx.tenantId))!;

    // 4. Issue tokens — delegate to AuthService so JTI is registered in the
    //    canonical path (blacklist-based revocation via Redis on logout/refresh).
    return { ...this.authService.issueTokens(user), isNewUser };
  }

  private async findByVkId(vkId: string, tenantId: string): Promise<User | null> {
    return this.userRepo
      .createQueryBuilder('u')
      .where('u.tenant_id = :tenantId', { tenantId })
      .andWhere(`u.external_ids ->> 'vk' = :vkId`, { vkId })
      .getOne();
  }

  private async createUserFromVk(
    vkId: string,
    info: VkUserInfoResponse,
    tenantId: string,
  ): Promise<User> {
    const first = info.user.first_name?.slice(0, 64) ?? 'VK';
    const last = info.user.last_name?.slice(0, 64) ?? '';
    const email = info.user.email ?? null;
    const profile = this.pii.encryptObject({ firstName: first, lastName: last, email });

    const user = this.userRepo.create({
      tenantId,
      role: UserRole.PARENT, // VK ID requires 14+; default to parent until verified
      login: `vk_${vkId}`,
      passwordHash: '', // OAuth-only — no password
      encryptedProfile: profile.ciphertext,
      profileIv: profile.iv,
      profileAuthTag: profile.authTag,
      classroomId: null,
      linkedChildIds: null,
      externalIds: { vk: vkId },
      parentalConsentAt: new Date(), // VK self-asserted age — treat as consent giver
      parentalConsentBy: null,
      isActive: true,
    });
    return this.userRepo.save(user);
  }

  private getConfig(): VkConfig | null {
    const clientId = this.config.get<string>('vkId.clientId');
    const clientSecret = this.config.get<string>('vkId.clientSecret');
    const redirectUri = this.config.get<string>('vkId.redirectUri');
    if (!clientId || !clientSecret || !redirectUri) return null;
    return { clientId, clientSecret, redirectUri };
  }

  private requireConfig(): VkConfig {
    const cfg = this.getConfig();
    if (!cfg) throw new BadRequestException('VK ID not configured on this server');
    return cfg;
  }
}
