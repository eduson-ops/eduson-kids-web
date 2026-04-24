import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantContext } from './tenant.context';

/** Method/class level decorator — endpoint can be called outside a tenant scope. */
import { SetMetadata } from '@nestjs/common';
export const ANONYMOUS_ALLOWED_KEY = 'tenant:anonymous_allowed';
export const AnonymousAllowed = () => SetMetadata(ANONYMOUS_ALLOWED_KEY, true);

/**
 * Reject requests that should be tenant-scoped but aren't. Anything not
 * decorated with @AnonymousAllowed must run inside a tenant scope.
 */
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private readonly tenantContext: TenantContext,
    private readonly reflector: Reflector,
  ) {}

  canActivate(ctx: ExecutionContext): boolean {
    const allowed = this.reflector.getAllAndOverride<boolean>(ANONYMOUS_ALLOWED_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (allowed) return true;

    const tenant = this.tenantContext.current();
    if (!tenant) throw new ForbiddenException('Tenant context required');

    return true;
  }
}
