import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialSchema1714000000000 implements MigrationInterface {
  name = 'CreateInitialSchema1714000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Users
    await queryRunner.query(`
      CREATE TYPE user_role_enum AS ENUM ('child', 'parent', 'teacher');

      CREATE TABLE "users" (
        "id"               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "role"             user_role_enum NOT NULL,
        "login"            VARCHAR(255) NOT NULL,
        "password_hash"    TEXT NOT NULL,
        "encrypted_profile" TEXT,
        "profile_iv"       TEXT,
        "profile_auth_tag" TEXT,
        "classroom_id"     UUID,
        "linked_child_ids" TEXT,
        "is_active"        BOOLEAN NOT NULL DEFAULT true,
        "created_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "last_login_at"    TIMESTAMPTZ,
        "updated_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE UNIQUE INDEX "UQ_users_login" ON "users" ("login");
      CREATE INDEX "IDX_users_role_active" ON "users" ("role", "is_active");
    `);

    // Classrooms
    await queryRunner.query(`
      CREATE TABLE "classrooms" (
        "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name"          VARCHAR(128) NOT NULL,
        "teacher_id"    UUID NOT NULL,
        "student_count" INT NOT NULL DEFAULT 0,
        "created_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX "IDX_classrooms_teacher" ON "classrooms" ("teacher_id");
    `);

    // Progress events (partitioned by month)
    await queryRunner.query(`
      CREATE TYPE progress_event_kind_enum AS ENUM (
        'lesson_solved', 'puzzle_solved', 'coins_earned', 'streak_touched'
      );

      CREATE TABLE "progress_events" (
        "id"         UUID NOT NULL DEFAULT gen_random_uuid(),
        "user_id"    UUID NOT NULL,
        "kind"       progress_event_kind_enum NOT NULL,
        "payload"    JSONB NOT NULL DEFAULT '{}',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      ) PARTITION BY RANGE ("created_at");

      -- Create initial partitions (current + next 2 months)
      CREATE TABLE "progress_events_2026_04" PARTITION OF "progress_events"
        FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
      CREATE TABLE "progress_events_2026_05" PARTITION OF "progress_events"
        FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
      CREATE TABLE "progress_events_2026_06" PARTITION OF "progress_events"
        FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
      CREATE TABLE "progress_events_default" PARTITION OF "progress_events" DEFAULT;

      CREATE INDEX "IDX_progress_user_created" ON "progress_events" ("user_id", "created_at");
      CREATE INDEX "IDX_progress_user_kind" ON "progress_events" ("user_id", "kind");
    `);

    // Subscriptions
    await queryRunner.query(`
      CREATE TYPE subscription_plan_enum AS ENUM (
        'trial', 'installment-48', 'monthly-recurring', 'yearly'
      );
      CREATE TYPE subscription_status_enum AS ENUM ('active', 'cancelled', 'expired');

      CREATE TABLE "subscriptions" (
        "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id"       UUID NOT NULL,
        "plan"          subscription_plan_enum NOT NULL,
        "status"        subscription_status_enum NOT NULL DEFAULT 'active',
        "lessons_total" INT NOT NULL DEFAULT 0,
        "lessons_used"  INT NOT NULL DEFAULT 0,
        "expires_at"    TIMESTAMPTZ,
        "auto_renew"    BOOLEAN NOT NULL DEFAULT false,
        "created_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX "IDX_subscriptions_user_status" ON "subscriptions" ("user_id", "status");
    `);

    // Audit logs
    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id"       UUID,
        "action"        VARCHAR(255) NOT NULL,
        "resource_type" VARCHAR(128) NOT NULL,
        "resource_id"   VARCHAR(255),
        "ip"            VARCHAR(64) NOT NULL,
        "user_agent"    TEXT NOT NULL,
        "created_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX "IDX_audit_user_created" ON "audit_logs" ("user_id", "created_at");
      CREATE INDEX "IDX_audit_action_created" ON "audit_logs" ("action", "created_at");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "subscriptions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "progress_events"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "classrooms"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TYPE IF EXISTS subscription_status_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS subscription_plan_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS progress_event_kind_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS user_role_enum`);
  }
}
