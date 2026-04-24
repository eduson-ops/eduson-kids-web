import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Phase 6 + 7 schema delta:
 *   - lessons + lesson_versions tables for AI content-factory
 *   - All RLS-enabled per the same tenant_id pattern
 *
 * Admin module has no schema changes — it leverages existing tables.
 *
 * Important: rolling delete window for lesson_versions is enforced in app
 * code, not DB. We don't FK-cascade lesson_versions to lessons because
 * we want to preserve methodist edit history even if a lesson is archived.
 */
export class AddLessonsAndAdmin1714000004000 implements MigrationInterface {
  name = 'AddLessonsAndAdmin1714000004000';

  public async up(qr: QueryRunner): Promise<void> {
    await qr.query(`
      CREATE TYPE lesson_status_enum AS ENUM (
        'queued', 'generating', 'pending_review', 'published', 'rejected', 'failed'
      );
      CREATE TYPE lesson_umk_enum AS ENUM (
        'bosova', 'polyakov', 'ugrinovich', 'semakin', 'generic'
      );
      CREATE TYPE lesson_focus_enum AS ENUM ('blocks', 'python', 'web', 'game');
      CREATE TYPE lesson_version_source_enum AS ENUM (
        'ai_initial', 'ai_regenerate', 'methodist_edit', 'rollback'
      );

      CREATE TABLE "lessons" (
        "id"                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id"            UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
        "topic_code"           VARCHAR(32) NOT NULL,
        "grade"                INT NOT NULL,
        "umk"                  lesson_umk_enum NOT NULL DEFAULT 'generic',
        "focus"                lesson_focus_enum NOT NULL,
        "title"                VARCHAR(255) NOT NULL,
        "status"               lesson_status_enum NOT NULL DEFAULT 'queued',
        "current_version_id"   UUID,
        "reviewer_id"          UUID,
        "ai_provider"          VARCHAR(32),
        "ai_cost_kopecks"      INT NOT NULL DEFAULT 0,
        "generation_seconds"   INT NOT NULL DEFAULT 0,
        "last_message"         TEXT,
        "created_at"           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"           TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX "IDX_lessons_tenant" ON "lessons" ("tenant_id");
      CREATE INDEX "IDX_lessons_tenant_status_updated" ON "lessons" ("tenant_id", "status", "updated_at");
      CREATE INDEX "IDX_lessons_tenant_topic_grade" ON "lessons" ("tenant_id", "topic_code", "grade");

      CREATE TABLE "lesson_versions" (
        "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id"   UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
        "lesson_id"   UUID NOT NULL,
        "sequence"    INT NOT NULL,
        "payload"     JSONB NOT NULL,
        "source"      lesson_version_source_enum NOT NULL,
        "created_by"  UUID NOT NULL,
        "note"        TEXT,
        "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX "IDX_lesson_versions_tenant" ON "lesson_versions" ("tenant_id");
      CREATE UNIQUE INDEX "UQ_lesson_versions_tenant_lesson_seq"
        ON "lesson_versions" ("tenant_id", "lesson_id", "sequence");
      CREATE INDEX "IDX_lesson_versions_tenant_lesson_created"
        ON "lesson_versions" ("tenant_id", "lesson_id", "created_at");

      ALTER TABLE "lessons" ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "lessons_tenant_isolation" ON "lessons"
        AS PERMISSIVE FOR ALL
        USING (
          "tenant_id"::text = current_setting('app.current_tenant', true)
          OR current_setting('app.bypass', true) = 'true'
        )
        WITH CHECK (
          "tenant_id"::text = current_setting('app.current_tenant', true)
          OR current_setting('app.bypass', true) = 'true'
        );

      ALTER TABLE "lesson_versions" ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "lesson_versions_tenant_isolation" ON "lesson_versions"
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
      DROP POLICY IF EXISTS "lesson_versions_tenant_isolation" ON "lesson_versions";
      DROP POLICY IF EXISTS "lessons_tenant_isolation" ON "lessons";
      DROP TABLE IF EXISTS "lesson_versions";
      DROP TABLE IF EXISTS "lessons";
      DROP TYPE IF EXISTS lesson_version_source_enum;
      DROP TYPE IF EXISTS lesson_focus_enum;
      DROP TYPE IF EXISTS lesson_umk_enum;
      DROP TYPE IF EXISTS lesson_status_enum;
    `);
  }
}
