/**
 * Seed script — run once to create initial teacher/parent/child accounts.
 * Usage: npx ts-node -r tsconfig-paths/register src/seed.ts
 * Or via npm: npm run seed
 *
 * Reads env from .env or environment variables (same as app).
 */

import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import { DataSource } from 'typeorm';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';

const ALGO = 'aes-256-gcm';
const IV_LENGTH = 12;

function encryptProfile(obj: Record<string, unknown>, keyBase64: string) {
  const key = Buffer.from(keyBase64, 'base64');
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const plaintext = JSON.stringify(obj);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    ciphertext: ciphertext.toString('base64'),
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
  };
}

async function main() {
  const piiKey = process.env['PII_KEY'];
  if (!piiKey) throw new Error('PII_KEY env var required');

  const ds = new DataSource({
    type: 'postgres',
    host: process.env['DB_HOST'] ?? 'localhost',
    port: parseInt(process.env['DB_PORT'] ?? '5432', 10),
    username: process.env['DB_USER'] ?? 'eduson',
    password: process.env['DB_PASSWORD'] ?? '',
    database: process.env['DB_NAME'] ?? 'eduson_kids',
    ssl: process.env['DB_SSL'] === 'true' ? { rejectUnauthorized: false } : false,
    synchronize: false,
    entities: [],
  });

  await ds.initialize();

  const accounts = [
    {
      role: 'teacher',
      login: 'teacher@eduson.school',
      password: process.env['SEED_TEACHER_PASSWORD'] ?? 'Teacher2024!',
      profile: { firstName: 'Анна', lastName: 'Иванова', email: 'teacher@eduson.school' },
    },
    {
      role: 'parent',
      login: 'parent@eduson.school',
      password: process.env['SEED_PARENT_PASSWORD'] ?? 'Parent2024!',
      profile: { firstName: 'Мария', lastName: 'Петрова', email: 'parent@eduson.school' },
    },
    {
      role: 'child',
      login: 'panda42',
      password: process.env['SEED_CHILD_PIN'] ?? '123456',
      profile: { firstName: 'Маша', lastName: 'П.' },
    },
    {
      role: 'child',
      login: 'tiger99',
      password: process.env['SEED_CHILD_PIN2'] ?? '654321',
      profile: { firstName: 'Саша', lastName: 'К.' },
    },
  ];

  for (const acc of accounts) {
    const existing = await ds.query(
      'SELECT id FROM users WHERE login = $1',
      [acc.login.toLowerCase()]
    );
    if (existing.length > 0) {
      console.log(`SKIP ${acc.role} ${acc.login} — already exists`);
      continue;
    }

    const passwordHash = await argon2.hash(acc.password);
    const enc = encryptProfile(acc.profile, piiKey);

    await ds.query(
      `INSERT INTO users (id, role, login, password_hash, encrypted_profile, profile_iv, profile_auth_tag, is_active, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, true, NOW(), NOW())`,
      [acc.role, acc.login.toLowerCase(), passwordHash, enc.ciphertext, enc.iv, enc.authTag]
    );
    console.log(`CREATED ${acc.role} ${acc.login}`);
  }

  await ds.destroy();
  console.log('Seed done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
