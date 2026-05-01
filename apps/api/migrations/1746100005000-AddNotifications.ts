import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotifications1746100005000 implements MigrationInterface {
  async up(qr: QueryRunner): Promise<void> {
    await qr.query(`
      CREATE TABLE notifications (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id      UUID NOT NULL,
        type         VARCHAR(64) NOT NULL,
        title        VARCHAR(255) NOT NULL,
        body         TEXT NOT NULL,
        read         BOOLEAN NOT NULL DEFAULT FALSE,
        slot_id      UUID,
        dedup_key    VARCHAR(128) UNIQUE,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX idx_notifications_user_read ON notifications (user_id, read);
      CREATE INDEX idx_notifications_user_id   ON notifications (user_id);
    `);
  }

  async down(qr: QueryRunner): Promise<void> {
    await qr.query(`DROP TABLE IF EXISTS notifications`);
  }
}
