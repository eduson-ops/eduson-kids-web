import { AsyncLocalStorage } from 'node:async_hooks';
import { Injectable, Logger } from '@nestjs/common';

/**
 * Lightweight per-request context for the active tenant. Uses Node's
 * AsyncLocalStorage so it survives async boundaries without needing
 * NestJS request-scoped providers (which are an order of magnitude slower).
 *
 * Lifecycle:
 *   1. TenantMiddleware extracts tenant from JWT / subdomain / header
 *      and calls `run(tenantId, fn)` to wrap the rest of the request.
 *   2. Anywhere downstream, `current()` returns the tenant id (or undefined
 *      for anonymous endpoints).
 *   3. TenantSubscriber stamps `tenant_id` on inserts.
 *   4. TenantQueryRunner sets `app.current_tenant` postgres GUC for RLS.
 *
 * Safety rule: any controller that touches multi-tenant data MUST be guarded
 * by either TenantGuard (require tenant) or AnonymousAllowed decorator.
 */
export interface TenantContextValue {
  tenantId: string;
  /** True when caller bypasses RLS (system jobs, super-admin, migrations) */
  bypass?: boolean;
  /** Tenant tier — useful for feature gating without re-querying */
  tier?: string;
  /** Optional parent tenant id — when running under a school inside a region */
  parentTenantId?: string;
}

@Injectable()
export class TenantContext {
  private readonly als = new AsyncLocalStorage<TenantContextValue>();
  private readonly logger = new Logger(TenantContext.name);

  /** Run `fn` inside a tenant scope. */
  run<T>(value: TenantContextValue, fn: () => T): T {
    return this.als.run(value, fn);
  }

  /** Get the active tenant id, or undefined when outside a tenant scope. */
  current(): TenantContextValue | undefined {
    return this.als.getStore();
  }

  /** Strict accessor — throws if no tenant is active. Use in tenant-required code paths. */
  require(): TenantContextValue {
    const v = this.als.getStore();
    if (!v) {
      this.logger.error('TenantContext.require() called outside tenant scope');
      throw new Error('TenantContext: no active tenant. Did the request bypass TenantMiddleware?');
    }
    return v;
  }

  /** Bypass tenant filtering — for system jobs, migrations, super-admin. */
  runAsSystem<T>(fn: () => T, opts: { tenantId?: string } = {}): T {
    return this.als.run(
      {
        tenantId: opts.tenantId ?? '00000000-0000-0000-0000-000000000001',
        bypass: true,
      },
      fn,
    );
  }
}
