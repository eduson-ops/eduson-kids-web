import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClassroomFields1746100004000 implements MigrationInterface {
  name = 'AddClassroomFields1746100004000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "classrooms"
        ADD COLUMN IF NOT EXISTS "invite_code"  VARCHAR(32),
        ADD COLUMN IF NOT EXISTS "is_archived"  BOOLEAN NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS "metadata"     JSONB NOT NULL DEFAULT '{}';

      ALTER TABLE "users"
        ADD COLUMN IF NOT EXISTS "crm_url"  TEXT,
        ADD COLUMN IF NOT EXISTS "track"    VARCHAR(32),
        ADD COLUMN IF NOT EXISTS "parent_phone" VARCHAR(32),
        ADD COLUMN IF NOT EXISTS "parent_email" VARCHAR(255);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "classrooms"
        DROP COLUMN IF EXISTS "invite_code",
        DROP COLUMN IF EXISTS "is_archived",
        DROP COLUMN IF EXISTS "metadata";

      ALTER TABLE "users"
        DROP COLUMN IF EXISTS "crm_url",
        DROP COLUMN IF EXISTS "track",
        DROP COLUMN IF EXISTS "parent_phone",
        DROP COLUMN IF EXISTS "parent_email";
    `);
  }
}
