import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateChatAndRooms1745500000000 implements MigrationInterface {
  name = 'CreateChatAndRooms1745500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // chat_messages
    await queryRunner.query(`
      CREATE TABLE "chat_messages" (
        "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "room"        VARCHAR(255) NOT NULL,
        "sender_login" VARCHAR(255) NOT NULL,
        "sender_name"  VARCHAR(128) NOT NULL,
        "sender_role"  VARCHAR(32)  NOT NULL,
        "text"         VARCHAR(2000) NOT NULL,
        "created_at"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX "IDX_chat_messages_room" ON "chat_messages" ("room");
      CREATE INDEX "IDX_chat_messages_room_created" ON "chat_messages" ("room", "created_at");
    `);

    // rooms
    await queryRunner.query(`
      CREATE TABLE "rooms" (
        "id"           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "classroom_id" UUID,
        "teacher_id"   VARCHAR(255) NOT NULL,
        "status"       VARCHAR(16) NOT NULL DEFAULT 'waiting',
        "meet_link"    VARCHAR(512) NOT NULL DEFAULT '',
        "created_at"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX "IDX_rooms_teacher_id" ON "rooms" ("teacher_id");
      CREATE INDEX "IDX_rooms_classroom_id" ON "rooms" ("classroom_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "rooms"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "chat_messages"`);
  }
}
