import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * D2-14 schema delta — adds a nullable JSONB column
 * `provider_response_raw` on `lesson_versions` so we can persist the full
 * AI-provider response body (Anthropic /v1/messages JSON) for audit and
 * reproducibility.
 *
 * The provider truncates oversized responses to ~64 KB before passing
 * them to the persistence layer, so the column stays manageable.
 *
 * Backwards compatible — column is nullable, existing rows unaffected.
 */
export class AddLessonVersionRawResponse1714000006000 implements MigrationInterface {
  name = 'AddLessonVersionRawResponse1714000006000';

  public async up(qr: QueryRunner): Promise<void> {
    await qr.query(`
      ALTER TABLE "lesson_versions"
        ADD COLUMN IF NOT EXISTS "provider_response_raw" JSONB DEFAULT NULL;
    `);
  }

  public async down(qr: QueryRunner): Promise<void> {
    await qr.query(`
      ALTER TABLE "lesson_versions"
        DROP COLUMN IF EXISTS "provider_response_raw";
    `);
  }
}
