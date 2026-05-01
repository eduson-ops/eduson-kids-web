import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Creates the lesson_access table for tracking which lessons a teacher
 * has unlocked for a student, and whether the student completed them.
 *
 * One row per (tenant_id, student_id, lesson_n) — unique constraint enforces
 * idempotent unlock. lessonN is the global lesson number (1-96) from curriculum.
 */
export class AddLessonAccess1714000007000 implements MigrationInterface {
  name = 'AddLessonAccess1714000007000';

  public async up(qr: QueryRunner): Promise<void> {
    await qr.query(`
      CREATE TABLE IF NOT EXISTS "lesson_access" (
        "id"            UUID          NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id"     UUID          NOT NULL,
        "student_id"    UUID          NOT NULL,
        "lesson_n"      INTEGER       NOT NULL,
        "classroom_id"  UUID          NOT NULL,
        "unlocked_by"   UUID          NOT NULL,
        "completed"     BOOLEAN       NOT NULL DEFAULT false,
        "score"         INTEGER       DEFAULT NULL,
        "unlocked_at"   TIMESTAMPTZ   NOT NULL DEFAULT now(),
        "completed_at"  TIMESTAMPTZ   DEFAULT NULL,
        "updated_at"    TIMESTAMPTZ   NOT NULL DEFAULT now(),
        CONSTRAINT "pk_lesson_access" PRIMARY KEY ("id"),
        CONSTRAINT "uq_lesson_access_student_lesson" UNIQUE ("tenant_id", "student_id", "lesson_n"),
        CONSTRAINT "chk_lesson_access_score" CHECK ("score" IS NULL OR ("score" >= 0 AND "score" <= 100))
      );
    `);

    await qr.query(`
      CREATE INDEX IF NOT EXISTS "idx_lesson_access_tenant_student"
        ON "lesson_access" ("tenant_id", "student_id");
    `);

    await qr.query(`
      CREATE INDEX IF NOT EXISTS "idx_lesson_access_tenant_classroom_lesson"
        ON "lesson_access" ("tenant_id", "classroom_id", "lesson_n");
    `);

    await qr.query(`
      CREATE OR REPLACE FUNCTION update_lesson_access_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await qr.query(`
      CREATE TRIGGER trg_lesson_access_updated_at
        BEFORE UPDATE ON "lesson_access"
        FOR EACH ROW EXECUTE FUNCTION update_lesson_access_updated_at();
    `);
  }

  public async down(qr: QueryRunner): Promise<void> {
    await qr.query(`DROP TRIGGER IF EXISTS trg_lesson_access_updated_at ON "lesson_access";`);
    await qr.query(`DROP FUNCTION IF EXISTS update_lesson_access_updated_at;`);
    await qr.query(`DROP INDEX IF EXISTS "idx_lesson_access_tenant_classroom_lesson";`);
    await qr.query(`DROP INDEX IF EXISTS "idx_lesson_access_tenant_student";`);
    await qr.query(`DROP TABLE IF EXISTS "lesson_access";`);
  }
}
