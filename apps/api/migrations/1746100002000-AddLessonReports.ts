import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLessonReports1746100002000 implements MigrationInterface {
  name = 'AddLessonReports1746100002000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE report_status_enum AS ENUM ('conducted', 'cancelled', 'transferred');

      CREATE TABLE "lesson_reports" (
        "id"                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "slot_id"                UUID,
        "teacher_id"             UUID NOT NULL,
        "student_id"             UUID NOT NULL,
        "conducted_at"           TIMESTAMPTZ NOT NULL,
        "status"                 report_status_enum NOT NULL DEFAULT 'conducted',
        "grade"                  INT CHECK (grade >= 1 AND grade <= 5),
        "notes"                  TEXT,
        "vk_record_url"          TEXT,
        "is_substitute"          BOOLEAN NOT NULL DEFAULT false,
        "substitute_teacher_id"  UUID,
        "lesson_n"               INT,
        "created_at"             TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX "IDX_reports_teacher_dt"  ON "lesson_reports" ("teacher_id", "conducted_at");
      CREATE INDEX "IDX_reports_student_dt"  ON "lesson_reports" ("student_id", "conducted_at");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "lesson_reports"`);
    await queryRunner.query(`DROP TYPE IF EXISTS report_status_enum`);
  }
}
