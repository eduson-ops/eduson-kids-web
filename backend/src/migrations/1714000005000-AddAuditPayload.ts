import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Phase 8 schema delta — adds an optional `payload` JSONB column to
 * `audit_logs` so that privileged actions can attach structured context
 * (e.g. old/new role, old/new isActive) to the log entry without parsing
 * free-form action strings.
 *
 * Backwards compatible — existing log writers that don't supply a payload
 * still work (column is nullable).
 */
export class AddAuditPayload1714000005000 implements MigrationInterface {
  name = 'AddAuditPayload1714000005000';

  public async up(qr: QueryRunner): Promise<void> {
    await qr.query(`
      ALTER TABLE "audit_logs"
        ADD COLUMN IF NOT EXISTS "payload" JSONB;
    `);
  }

  public async down(qr: QueryRunner): Promise<void> {
    await qr.query(`
      ALTER TABLE "audit_logs"
        DROP COLUMN IF EXISTS "payload";
    `);
  }
}
