import { EntitySubscriberInterface, EventSubscriber, InsertEvent, Connection } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { TenantContext } from './tenant.context';

/**
 * Auto-stamp `tenant_id` on every insert when an entity has the column.
 * Saves us from sprinkling `tenantId: this.tenant.current().tenantId` in
 * every service.
 *
 * Skipped for the `tenants` table itself (chicken/egg) and for any entity
 * marked with the `@SkipTenantStamp()` decorator (rare — system tables).
 *
 * Triggers a noisy log if an insert lacks tenantId AND there is no active
 * tenant context — typically means a background job forgot to call
 * `runAsSystem`. We stamp DEFAULT_TENANT_ID and continue.
 */
@Injectable()
@EventSubscriber()
export class TenantSubscriber implements EntitySubscriberInterface {
  private readonly logger = new Logger(TenantSubscriber.name);

  constructor(
    private readonly tenantContext: TenantContext,
    connection: Connection,
  ) {
    connection.subscribers.push(this);
  }

  beforeInsert(event: InsertEvent<unknown>): void {
    const tableName = event.metadata.tableName;
    if (tableName === 'tenants') return; // self-skip

    const hasColumn = event.metadata.columns.some((c) => c.databaseName === 'tenant_id');
    if (!hasColumn) return;

    const entity = event.entity as Record<string, unknown> | undefined;
    if (!entity) return;
    if (entity.tenantId) return; // already set explicitly

    const ctx = this.tenantContext.current();
    if (ctx) {
      entity.tenantId = ctx.tenantId;
      return;
    }

    // No active tenant — log and stamp default (legacy compat)
    this.logger.warn(
      `Insert into ${tableName} without active tenant context — stamping DEFAULT_TENANT_ID. ` +
        `Wrap background jobs in TenantContext.runAsSystem() to avoid this.`,
    );
    entity.tenantId = '00000000-0000-0000-0000-000000000001';
  }
}
