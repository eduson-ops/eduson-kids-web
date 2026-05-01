import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGuestTokens1746100003000 implements MigrationInterface {
  name = 'AddGuestTokens1746100003000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE guest_token_type_enum AS ENUM ('trial', 'masterclass');

      CREATE TABLE "guest_tokens" (
        "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "token"      VARCHAR(64) NOT NULL,
        "type"       guest_token_type_enum NOT NULL DEFAULT 'trial',
        "metadata"   JSONB NOT NULL DEFAULT '{}',
        "used"       BOOLEAN NOT NULL DEFAULT false,
        "expires_at" TIMESTAMPTZ NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT "UQ_guest_token" UNIQUE ("token")
      );

      CREATE INDEX "IDX_guest_token_token" ON "guest_tokens" ("token");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "guest_tokens"`);
    await queryRunner.query(`DROP TYPE IF EXISTS guest_token_type_enum`);
  }
}
