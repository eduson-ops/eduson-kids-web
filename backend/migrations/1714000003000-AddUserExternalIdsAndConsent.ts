import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Phase 5 schema delta — adds two columns to `users`:
 *   - external_ids JSONB — keyed by provider (vk/sferum/esia/yandex)
 *   - parental_consent_at + parental_consent_by — 152-FZ for users <14
 *
 * The matching code already exists in User entity (Phase 1). This migration
 * brings the DB into sync.
 *
 * Adds a partial GIN index on external_ids->>'vk' and ->'sferum' for fast
 * "find user by external id" lookups during OAuth callback.
 */
export class AddUserExternalIdsAndConsent1714000003000 implements MigrationInterface {
  name = 'AddUserExternalIdsAndConsent1714000003000';

  public async up(qr: QueryRunner): Promise<void> {
    await qr.query(`
      ALTER TABLE "users"
        ADD COLUMN IF NOT EXISTS "external_ids" JSONB NOT NULL DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS "parental_consent_at" TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS "parental_consent_by" UUID;

      -- Lookup indexes for OAuth callback resolution
      CREATE INDEX IF NOT EXISTS "IDX_users_external_vk"
        ON "users" ((external_ids ->> 'vk'))
        WHERE external_ids ? 'vk';

      CREATE INDEX IF NOT EXISTS "IDX_users_external_sferum"
        ON "users" ((external_ids ->> 'sferum'))
        WHERE external_ids ? 'sferum';

      CREATE INDEX IF NOT EXISTS "IDX_users_external_esia"
        ON "users" ((external_ids ->> 'esia'))
        WHERE external_ids ? 'esia';

      CREATE INDEX IF NOT EXISTS "IDX_users_external_yandex"
        ON "users" ((external_ids ->> 'yandex'))
        WHERE external_ids ? 'yandex';

      CREATE INDEX IF NOT EXISTS "IDX_users_consent_at"
        ON "users" ("parental_consent_at")
        WHERE "parental_consent_at" IS NULL;
    `);
  }

  public async down(qr: QueryRunner): Promise<void> {
    await qr.query(`
      DROP INDEX IF EXISTS "IDX_users_consent_at";
      DROP INDEX IF EXISTS "IDX_users_external_yandex";
      DROP INDEX IF EXISTS "IDX_users_external_esia";
      DROP INDEX IF EXISTS "IDX_users_external_sferum";
      DROP INDEX IF EXISTS "IDX_users_external_vk";

      ALTER TABLE "users"
        DROP COLUMN IF EXISTS "parental_consent_by",
        DROP COLUMN IF EXISTS "parental_consent_at",
        DROP COLUMN IF EXISTS "external_ids";
    `);
  }
}
