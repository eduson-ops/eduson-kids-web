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
  // ALTER TYPE ... ADD VALUE cannot run inside a transaction block in PostgreSQL.
  transaction = false;

  public async up(qr: QueryRunner): Promise<void> {
    // Extend user_role_enum with the 5 admin/staff roles introduced in Phase 2+
    // (methodist, curator, school_admin, regional_admin, platform_admin).
    // Postgres requires each ALTER TYPE ... ADD VALUE to run on its own
    // statement (they implicitly commit), so we issue them individually.
    // NOTE: down() cannot cleanly drop these enum values — Postgres does not
    // support DROP VALUE on an enum. Rolling back this migration leaves the
    // extra values in place, which is harmless (unused values don't break
    // anything) but worth knowing.
    await qr.query(`ALTER TYPE user_role_enum ADD VALUE IF NOT EXISTS 'methodist';`);
    await qr.query(`ALTER TYPE user_role_enum ADD VALUE IF NOT EXISTS 'curator';`);
    await qr.query(`ALTER TYPE user_role_enum ADD VALUE IF NOT EXISTS 'school_admin';`);
    await qr.query(`ALTER TYPE user_role_enum ADD VALUE IF NOT EXISTS 'regional_admin';`);
    await qr.query(`ALTER TYPE user_role_enum ADD VALUE IF NOT EXISTS 'platform_admin';`);

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
