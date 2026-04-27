import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

/**
 * F-12: read access token from `access_token` HttpOnly cookie when present,
 * otherwise fall back to the legacy `Authorization: Bearer <jwt>` header.
 *
 * Cookie auth is preferred because HttpOnly cookies are immune to XSS token
 * theft (no JS access). The Bearer header path stays for backwards compat
 * with native clients (Capacitor) and any browser sessions that still hold a
 * localStorage token from before the migration.
 */
const cookieExtractor = (req: Request | undefined): string | null => {
  const cookies = (req as { cookies?: Record<string, string> } | undefined)?.cookies;
  return cookies?.['access_token'] ?? null;
};

/**
 * Multi-tenant JWT payload.
 *
 * Required claims:
 *   - sub: user id
 *   - role: user role (UserRole enum value)
 *   - tnt: tenant id (UUID) — defaults to system tenant for guest tokens
 *
 * Optional:
 *   - tier: tenant tier ('school'/'b2c'/'regional'/...) — convenience for gating
 *   - ptnt: parent tenant id — when user logs in under a school nested in a region
 *   - sys: bypass-RLS marker — only set for explicit system tokens
 */
export interface JwtPayload {
  sub: string;
  role: string;
  tnt: string;
  tier?: string;
  ptnt?: string;
  sys?: boolean;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.accessSecret') ?? '',
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    if (!payload.sub || !payload.role) throw new UnauthorizedException();
    if (!payload.tnt) {
      // Legacy tokens without tnt — accept temporarily, stamp default
      // tenant. Will be removed once all clients refresh (Q3 2026).
      payload.tnt = '00000000-0000-0000-0000-000000000001';
    }
    return payload;
  }
}
