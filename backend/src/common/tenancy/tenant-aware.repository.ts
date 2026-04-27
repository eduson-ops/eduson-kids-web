import { DataSource } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { TenantContext } from './tenant.context';

/**
 * Wraps a transaction with `SET LOCAL app.current_tenant` so PG RLS can
 * scope every query to the active tenant without each service writing
 * `where tenant_id = ...`. RLS becomes the safety net; explicit
 * tenant_id stays as defence-in-depth.
 *
 * Usage:
 *   await this.txWithTenant.run(async (em) => {
 *     return em.find(SomeEntity, { ... });
 *   });
 *
 * Bypass mode (system jobs):
 *   await this.txWithTenant.runAsSystem(async (em) => { ... });
 */
@Injectable()
export class TenantAwareTransaction {
  private readonly logger = new Logger(TenantAwareTransaction.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly tenantContext: TenantContext,
  ) {}

  async run<T>(work: (em: ReturnType<DataSource['manager']['transaction']>) => Promise<T>): Promise<T> {
    const ctx = this.tenantContext.require();
    return this.dataSource.transaction(async (em) => {
      // Use parameterised function to avoid string injection
      await em.query('SELECT app_set_tenant($1, $2)', [ctx.tenantId, ctx.bypass ?? false]);
      return work(em as any);
    }) as Promise<T>;
  }

  async runAsSystem<T>(work: (em: any) => Promise<T>): Promise<T> {
    return this.dataSource.transaction(async (em) => {
      await em.query('SELECT app_set_tenant($1, $2)', [
        '00000000-0000-0000-0000-000000000001',
        true,
      ]);
      return work(em);
    });
  }
}
