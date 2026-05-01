import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Extends subscriptions table:
 * 1. Adds new plan enum values: course-full, school-per-class, regional, whitelabel
 * 2. Adds payment reconciliation columns: price_kopecks, provider_payment_id, provider
 * 3. Adds status enum values: pending, failed (ЮKassa async flow)
 */
export class ExtendSubscriptionSchema1714000008000 implements MigrationInterface {
  name = 'ExtendSubscriptionSchema1714000008000';
  // ALTER TYPE ... ADD VALUE cannot run inside a transaction block in PostgreSQL.
  transaction = false;

  async up(queryRunner: QueryRunner): Promise<void> {
    // Add new plan enum values (PostgreSQL requires ALTER TYPE ... ADD VALUE)
    await queryRunner.query(`ALTER TYPE subscription_plan_enum ADD VALUE IF NOT EXISTS 'course-full'`);
    await queryRunner.query(`ALTER TYPE subscription_plan_enum ADD VALUE IF NOT EXISTS 'school-per-class'`);
    await queryRunner.query(`ALTER TYPE subscription_plan_enum ADD VALUE IF NOT EXISTS 'regional'`);
    await queryRunner.query(`ALTER TYPE subscription_plan_enum ADD VALUE IF NOT EXISTS 'whitelabel'`);

    // Add status enum values for async payment flow
    await queryRunner.query(`ALTER TYPE subscription_status_enum ADD VALUE IF NOT EXISTS 'pending'`);
    await queryRunner.query(`ALTER TYPE subscription_status_enum ADD VALUE IF NOT EXISTS 'failed'`);

    // Add payment reconciliation columns
    await queryRunner.query(`
      ALTER TABLE subscriptions
        ADD COLUMN IF NOT EXISTS price_kopecks BIGINT NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS provider_payment_id VARCHAR(128),
        ADD COLUMN IF NOT EXISTS provider VARCHAR(32)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE subscriptions
        DROP COLUMN IF EXISTS provider,
        DROP COLUMN IF EXISTS provider_payment_id,
        DROP COLUMN IF EXISTS price_kopecks
    `);
    // PostgreSQL does not support removing enum values directly;
    // a full type recreation would be needed — skipped for simplicity.
  }
}
