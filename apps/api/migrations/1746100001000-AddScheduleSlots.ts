import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddScheduleSlots1746100001000 implements MigrationInterface {
  name = 'AddScheduleSlots1746100001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE slot_type_enum AS ENUM ('regular', 'trial', 'makeup');
      CREATE TYPE slot_status_enum AS ENUM ('scheduled', 'conducted', 'cancelled', 'transferred');

      CREATE TABLE "schedule_slots" (
        "id"                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "teacher_id"        UUID NOT NULL,
        "student_id"        UUID,
        "classroom_id"      UUID,
        "datetime"          TIMESTAMPTZ NOT NULL,
        "duration_min"      INT NOT NULL DEFAULT 60,
        "type"              slot_type_enum NOT NULL DEFAULT 'regular',
        "status"            slot_status_enum NOT NULL DEFAULT 'scheduled',
        "rescheduled_to_id" UUID,
        "zoom_link"         TEXT,
        "notes"             TEXT,
        "created_at"        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"        TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX "IDX_schedule_teacher_dt" ON "schedule_slots" ("teacher_id", "datetime");
      CREATE INDEX "IDX_schedule_student_dt" ON "schedule_slots" ("student_id", "datetime");
      CREATE INDEX "IDX_schedule_classroom"  ON "schedule_slots" ("classroom_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "schedule_slots"`);
    await queryRunner.query(`DROP TYPE IF EXISTS slot_status_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS slot_type_enum`);
  }
}
