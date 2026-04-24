import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Cloud-save + versioning tables.
 *
 * Tables:
 *   - projects: parent entity per user creation
 *   - project_versions: rolling history of saves (max 20 per project,
 *     enforced in app code; DB has no count constraint to allow temporary
 *     overshoot during writes)
 *
 * Both tables are tenant-scoped and RLS-enabled (same policy template
 * as 1714000001000).
 */
export class AddProjects1714000002000 implements MigrationInterface {
  name = 'AddProjects1714000002000';

  public async up(qr: QueryRunner): Promise<void> {
    await qr.query(`
      CREATE TYPE project_type_enum AS ENUM ('game', 'site', 'python', 'capstone', 'ege');
      CREATE TYPE project_visibility_enum AS ENUM ('private', 'unlisted', 'public', 'classroom');
      CREATE TYPE version_source_enum AS ENUM ('autosave', 'manual', 'rollback', 'import', 'template');

      CREATE TABLE "projects" (
        "id"                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id"            UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
        "owner_id"             UUID NOT NULL,
        "classroom_id"         UUID,
        "name"                 VARCHAR(255) NOT NULL,
        "type"                 project_type_enum NOT NULL,
        "visibility"           project_visibility_enum NOT NULL DEFAULT 'private',
        "current_version_id"   UUID,
        "current_size_bytes"   INT NOT NULL DEFAULT 0,
        "stats"                JSONB NOT NULL DEFAULT '{}',
        "share_token"          VARCHAR(64),
        "deleted_at"           TIMESTAMPTZ,
        "created_at"           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"           TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX "IDX_projects_tenant" ON "projects" ("tenant_id");
      CREATE INDEX "IDX_projects_tenant_owner_updated" ON "projects" ("tenant_id", "owner_id", "updated_at");
      CREATE INDEX "IDX_projects_tenant_classroom_updated" ON "projects" ("tenant_id", "classroom_id", "updated_at") WHERE "classroom_id" IS NOT NULL;
      CREATE UNIQUE INDEX "UQ_projects_share_token" ON "projects" ("share_token") WHERE "share_token" IS NOT NULL;
      CREATE INDEX "IDX_projects_deleted" ON "projects" ("deleted_at") WHERE "deleted_at" IS NOT NULL;

      CREATE TABLE "project_versions" (
        "id"           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id"    UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
        "project_id"   UUID NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
        "sequence"     INT NOT NULL,
        "content_json" JSONB NOT NULL,
        "size_bytes"   INT NOT NULL,
        "source"       version_source_enum NOT NULL DEFAULT 'autosave',
        "note"         VARCHAR(255),
        "created_by"   UUID NOT NULL,
        "created_at"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX "IDX_project_versions_tenant" ON "project_versions" ("tenant_id");
      CREATE UNIQUE INDEX "UQ_project_versions_tenant_project_seq" ON "project_versions" ("tenant_id", "project_id", "sequence");
      CREATE INDEX "IDX_project_versions_tenant_project_created" ON "project_versions" ("tenant_id", "project_id", "created_at");

      ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "projects_tenant_isolation" ON "projects"
        AS PERMISSIVE FOR ALL
        USING (
          "tenant_id"::text = current_setting('app.current_tenant', true)
          OR current_setting('app.bypass', true) = 'true'
        )
        WITH CHECK (
          "tenant_id"::text = current_setting('app.current_tenant', true)
          OR current_setting('app.bypass', true) = 'true'
        );

      ALTER TABLE "project_versions" ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "project_versions_tenant_isolation" ON "project_versions"
        AS PERMISSIVE FOR ALL
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

  public async down(qr: QueryRunner): Promise<void> {
    await qr.query(`
      DROP POLICY IF EXISTS "project_versions_tenant_isolation" ON "project_versions";
      DROP POLICY IF EXISTS "projects_tenant_isolation" ON "projects";
      DROP TABLE IF EXISTS "project_versions";
      DROP TABLE IF EXISTS "projects";
      DROP TYPE IF EXISTS version_source_enum;
      DROP TYPE IF EXISTS project_visibility_enum;
      DROP TYPE IF EXISTS project_type_enum;
    `);
  }
}
