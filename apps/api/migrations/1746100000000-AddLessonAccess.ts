import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLessonAccess1746100000000 implements MigrationInterface {
  name = 'AddLessonAccess1746100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "lesson_access" (
        "id"           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "student_id"   UUID NOT NULL,
        "lesson_n"     INT NOT NULL,
        "unlocked"     BOOLEAN NOT NULL DEFAULT true,
        "completed"    BOOLEAN NOT NULL DEFAULT false,
        "score"        INT,
        "classroom_id" UUID,
        "unlocked_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "completed_at" TIMESTAMPTZ,
        CONSTRAINT "UQ_lesson_access_student_lesson" UNIQUE ("student_id", "lesson_n")
      );

      CREATE INDEX "IDX_lesson_access_student" ON "lesson_access" ("student_id");
      CREATE INDEX "IDX_lesson_access_classroom" ON "lesson_access" ("classroom_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "lesson_access"`);
  }
}
