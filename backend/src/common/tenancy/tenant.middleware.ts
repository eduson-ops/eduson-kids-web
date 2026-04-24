import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TenantContext } from './tenant.context';
import { DEFAULT_TENANT_ID } from '../../modules/tenants/tenant.entity';

/**
 * Resolve active tenant from (priority order):
 *   1. JWT claim `tnt` (most authoritative — set when user logged in)
 *   2. `X-Tenant-Slug` header (for service-to-service or super-admin)
 *   3. Subdomain ({slug}.kubik.school)
 *   4. Default tenant (legacy single-tenant requests during migration window)
 *
 * Resolution uses an in-memory cache keyed by slug; cache TTL 60s. For
 * higher TPS this should move to Redis — TenantCache abstraction below.
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantMiddleware.name);

  constructor(
    private readonly tenantContext: TenantContext,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
    let tenantId: string | undefined;
    let tier: string | undefined;
    let parentTenantId: string | undefined;
    let bypass = false;

    // 1. JWT claim
    const auth = req.headers.authorization;
    if (auth && auth.startsWith('Bearer ')) {
      try {
        const token = auth.substring(7);
        const payload = await this.jwt.verifyAsync<{
          sub: string;
          tnt?: string;
          tier?: string;
          ptnt?: string;
          sys?: boolean;
        }>(token);
        if (payload.tnt) tenantId = payload.tnt;
        if (payload.tier) tier = payload.tier;
        if (payload.ptnt) parentTenantId = payload.ptnt;
        if (payload.sys === true) bypass = true;
      } catch {
        // ignore — let downstream auth guards reject
      }
    }

    // 2. Header (service-to-service, super-admin override)
    const headerSlug = req.headers['x-tenant-slug'];
    if (!tenantId && typeof headerSlug === 'string' && this.isInternalRequest(req)) {
      tenantId = await this.resolveSlug(headerSlug);
    }

    // 3. Subdomain
    if (!tenantId) {
      const host = req.headers.host || '';
      const slug = this.extractSlugFromHost(host);
      if (slug) tenantId = await this.resolveSlug(slug);
    }

    // 4. Default fallback (legacy compat — will be removed Q3 2026)
    // Audit each fallback hit so we know which routes still rely on the
    // implicit default tenant before we yank it.
    if (!tenantId) {
      this.logger.warn(
        `Tenant fallback to DEFAULT — path=${req.path} ip=${req.ip} host=${req.headers.host ?? 'unknown'}`,
      );
      tenantId = DEFAULT_TENANT_ID;
    }

    this.tenantContext.run(
      { tenantId, tier, parentTenantId, bypass },
      () => next(),
    );
  }

  private isInternalRequest(req: Request): boolean {
    const internalSecret = this.config.get<string>('internal.serviceSecret');
    if (!internalSecret) return false;
    return req.headers['x-internal-secret'] === internalSecret;
  }

  /**
   * Slug → tenant id resolver. In production wires to TenantsService with a
   * Redis-backed cache. For now uses a placeholder that delegates to
   * `TenantsService.resolveSlug`; we inject lazily to avoid circular dep.
   */
  private slugCache = new Map<string, { id: string; expiresAt: number }>();
  private readonly CACHE_TTL_MS = 60_000;
  private resolverFn?: (slug: string) => Promise<string | undefined>;

  setResolver(fn: (slug: string) => Promise<string | undefined>): void {
    this.resolverFn = fn;
  }

  private async resolveSlug(slug: string): Promise<string | undefined> {
    const now = Date.now();
    const cached = this.slugCache.get(slug);
    if (cached && cached.expiresAt > now) return cached.id;
    if (!this.resolverFn) return undefined;
    const id = await this.resolverFn(slug);
    if (id) this.slugCache.set(slug, { id, expiresAt: now + this.CACHE_TTL_MS });
    return id;
  }

  private extractSlugFromHost(host: string): string | null {
    if (!host) return null;
    const cleanHost = host.split(':')[0];
    const parts = cleanHost.split('.');
    // {slug}.kubik.school or {slug}.edusonkids.com → first label
    if (parts.length >= 3) return parts[0];
    return null;
  }
}
