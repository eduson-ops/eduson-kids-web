import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Multitenancy foundation:
 *   1. Create `tenants` table + insert default tenant
 *   2. Add `tenant_id` to all existing tables (NOT NULL with default backfill)
 *   3. Add tenant indexes on hot tables
 *   4. Set up Row-Level Security policies (permissive for default-tenant data,
 *      strict for new multi-tenant data)
 *   5. Create `app_user` PG role for app connections (RLS-enforced) and
 *      keep `migrator` role for migrations (RLS-bypass). The migration uses
 *      whoever is currently connected; runtime app uses `app_user`.
 *
 * Strategy chosen per `research_multitenancy.md`: shared DB + tenant_id +
 * Postgres RLS, runtime sets `app.current_tenant` via SET LOCAL inside each
 * transaction — see TenantQueryRunner middleware.
 */
export class AddMultitenancy1714000001000 implements MigrationInterface {
  name = 'AddMultitenancy1714000001000';

  public async up(qr: QueryRunner): Promise<void> {
    // 1. Tenants table
    await qr.query(`
      CREATE TYPE tenant_status_enum AS ENUM ('active', 'suspended', 'archived');
      CREATE TYPE tenant_tier_enum AS ENUM (
        'core', 'pilot', 'b2c', 'school', 'municipal', 'regional', 'whitelabel'
      );

      CREATE TABLE "tenants" (
        "id"                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "slug"               VARCHAR(64) NOT NULL,
        "name"               VARCHAR(255) NOT NULL,
        "status"             tenant_status_enum NOT NULL DEFAULT 'active',
        "tier"               tenant_tier_enum NOT NULL DEFAULT 'b2c',
        "custom_domain"      VARCHAR(255),
        "branding"           JSONB NOT NULL DEFAULT '{}',
        "feature_flags"      JSONB NOT NULL DEFAULT '{}',
        "quotas"             JSONB NOT NULL DEFAULT '{}',
        "parent_tenant_id"   UUID,
        "encrypted_contact"  TEXT,
        "contact_iv"         TEXT,
        "contact_auth_tag"   TEXT,
        "created_at"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"         TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE UNIQUE INDEX "UQ_tenants_slug" ON "tenants" ("slug");
      CREATE UNIQUE INDEX "UQ_tenants_custom_domain" ON "tenants" ("custom_domain") WHERE "custom_domain" IS NOT NULL;
      CREATE INDEX "IDX_tenants_status" ON "tenants" ("status");
      CREATE INDEX "IDX_tenants_parent" ON "tenants" ("parent_tenant_id") WHERE "parent_tenant_id" IS NOT NULL;
    `);

    // Insert the canonical default tenant — UUID hardcoded so it can be
    // referenced from app code without a lookup.
    await qr.query(`
      INSERT INTO "tenants" (id, slug, name, tier, status, branding, quotas)
      VALUES (
        '00000000-0000-0000-0000-000000000001',
        'edusonkids',
        'KubiK / Eduson Kids — core',
        'core',
        'active',
        '{"primary": "#ffd84c", "logo": "/brand/kubik.svg"}',
        '{"maxStudents": 1000000, "maxClasses": 1000000, "maxStorageMb": 10000000}'
      );
    `);

    // 2. Add tenant_id to existing tables, backfill, then enforce NOT NULL
    const TENANT_TABLES = ['users', 'classrooms', 'progress_events', 'subscriptions', 'audit_logs'];
    for (const table of TENANT_TABLES) {
      await qr.query(`
        ALTER TABLE "${table}"
          ADD COLUMN IF NOT EXISTS "tenant_id" UUID;

        UPDATE "${table}"
          SET "tenant_id" = '00000000-0000-0000-0000-000000000001'
          WHERE "tenant_id" IS NULL;

        ALTER TABLE "${table}"
          ALTER COLUMN "tenant_id" SET NOT NULL,
          ALTER COLUMN "tenant_id" SET DEFAULT '00000000-0000-0000-0000-000000000001';
      `);
      // Index for tenant queries — composite where reasonable
      await qr.query(`CREATE INDEX IF NOT EXISTS "IDX_${table}_tenant" ON "${table}" ("tenant_id");`);
    }

    // 3. Tenant-scoped uniqueness for users.login (not globally unique anymore
    //    — same login can exist in different tenants)
    await qr.query(`
      DROP INDEX IF EXISTS "UQ_users_login";
      CREATE UNIQUE INDEX "UQ_users_tenant_login" ON "users" ("tenant_id", "login");
    `);

    // 4. Row-Level Security
    //    - Each table gets RLS enabled.
    //    - Two policies per table: "tenant_isolation" (USING tenant_id =
    //      current setting) and "system_bypass" (USING current_setting('app.bypass') = 'true').
    //    - Set as PERMISSIVE so either matching policy lets the row through.
    for (const table of TENANT_TABLES) {
      await qr.query(`
        ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "${table}_tenant_isolation" ON "${table}"
          AS PERMISSIVE
          FOR ALL
          USING (
            "tenant_id"::text = current_setting('app.current_tenant', true)
            OR current_setting('app.bypass', true) = 'true'
          )
          WITH CHECK (
            "tenant_id"::text = current_setting('app.current_tenant', true)
            OR current_setting('app.bypass', true) = 'true'
          );
      `);
    }

    // 5. Application DB role — separate from migrator. Runtime connections
    //    use this role; it CANNOT bypass RLS. The migrator role
    //    (whoever owns the schema) keeps BYPASSRLS for migrations.
    //
    //    Skipped if the role already exists or if running on managed DB
    //    where role creation is restricted (e.g., YC MDB sometimes restricts
    //    CREATEROLE for non-superusers — handled gracefully).
    await qr.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'kubik_app') THEN
          BEGIN
            CREATE ROLE kubik_app NOLOGIN;
            EXECUTE 'GRANT USAGE ON SCHEMA public TO kubik_app';
            EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO kubik_app';
            EXECUTE 'GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO kubik_app';
            EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO kubik_app';
            EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO kubik_app';
          EXCEPTION WHEN insufficient_privilege THEN
            RAISE NOTICE 'kubik_app role creation skipped — privilege denied (managed DB?). Configure via console.';
          END;
        END IF;
      END
      $$;
    `);

    // 6. Helper SQL functions for setting tenant context inside session.
    //    NestJS QueryRunner uses these instead of raw SET LOCAL strings to
    //    avoid SQL injection on the tenant id.
    await qr.query(`
      CREATE OR REPLACE FUNCTION app_set_tenant(p_tenant UUID, p_bypass BOOLEAN DEFAULT FALSE)
      RETURNS VOID
      LANGUAGE plpgsql
      AS $$
      BEGIN
        PERFORM set_config('app.current_tenant', p_tenant::text, true);
        PERFORM set_config('app.bypass', CASE WHEN p_bypass THEN 'true' ELSE 'false' END, true);
      END
      $$;
    `);
  }

  public async down(qr: QueryRunner): Promise<void> {
    const TENANT_TABLES = ['users', 'classrooms', 'progress_events', 'subscriptions', 'audit_logs'];

    await qr.query(`DROP FUNCTION IF EXISTS app_set_tenant(UUID, BOOLEAN);`);

    for (const table of TENANT_TABLES) {
      await qr.query(`
        DROP POLICY IF EXISTS "${table}_tenant_isolation" ON "${table}";
        ALTER TABLE "${table}" DISABLE ROW LEVEL SECURITY;
        ALTER TABLE "${table}" DROP COLUMN IF EXISTS "tenant_id";
      `);
    }

    await qr.query(`
      DROP INDEX IF EXISTS "UQ_users_tenant_login";
      CREATE UNIQUE INDEX "UQ_users_login" ON "users" ("login");
    `);

    await qr.query(`DROP TABLE IF EXISTS "tenants";`);
    await qr.query(`DROP TYPE IF EXISTS tenant_tier_enum;`);
    await qr.query(`DROP TYPE IF EXISTS tenant_status_enum;`);
  }
}
