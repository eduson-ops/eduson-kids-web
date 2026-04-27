#!/usr/bin/env node
/**
 * D2-16: CLI to restore archived audit logs from YC Object Storage.
 *
 * Usage:
 *   AUDIT_ARCHIVE_BUCKET=kubik-audit-archive \
 *   AUDIT_ARCHIVE_ACCESS_KEY_ID=... \
 *   AUDIT_ARCHIVE_SECRET_ACCESS_KEY=... \
 *   node scripts/audit-restore.mjs <tenantId> <YYYY-MM-DD> [--out file.ndjson]
 *
 * Output: NDJSON to stdout (or to --out file). Exit 0 on success, 1 on error.
 *
 * Use case: 152-ФЗ regulator request — fetch archived audit log for a given
 * tenant + day older than AUDIT_ARCHIVE_RETAIN_DAYS (cutoff).
 */

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { gunzipSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { Buffer } from 'node:buffer';
import process from 'node:process';

function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

async function main() {
  const args = process.argv.slice(2);
  const tenantId = args[0];
  const day = args[1];
  const outIdx = args.indexOf('--out');
  const outPath = outIdx >= 0 ? args[outIdx + 1] : null;

  if (!tenantId || !day || !/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    console.error('Usage: audit-restore.mjs <tenantId> <YYYY-MM-DD> [--out file]');
    process.exit(2);
  }

  const bucket = process.env.AUDIT_ARCHIVE_BUCKET;
  const accessKeyId = process.env.AUDIT_ARCHIVE_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AUDIT_ARCHIVE_SECRET_ACCESS_KEY;
  if (!bucket || !accessKeyId || !secretAccessKey) {
    console.error(
      'Missing env: AUDIT_ARCHIVE_BUCKET, AUDIT_ARCHIVE_ACCESS_KEY_ID, AUDIT_ARCHIVE_SECRET_ACCESS_KEY',
    );
    process.exit(2);
  }

  const client = new S3Client({
    region: process.env.AUDIT_ARCHIVE_REGION ?? 'ru-central1',
    endpoint: process.env.AUDIT_ARCHIVE_ENDPOINT ?? 'https://storage.yandexcloud.net',
    forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey },
  });

  const Key = `audit-archive/${tenantId}/${day}.ndjson.gz`;
  try {
    const out = await client.send(new GetObjectCommand({ Bucket: bucket, Key }));
    const buf = await streamToBuffer(out.Body);
    const ndjson = gunzipSync(buf).toString('utf8');
    if (outPath) {
      writeFileSync(outPath, ndjson);
      console.error(`Wrote ${ndjson.length} bytes to ${outPath}`);
    } else {
      process.stdout.write(ndjson);
    }
  } catch (err) {
    if (err?.name === 'NoSuchKey' || err?.$metadata?.httpStatusCode === 404) {
      console.error(`No archive found for ${Key}`);
      process.exit(1);
    }
    console.error('S3 error:', err?.message ?? err);
    process.exit(1);
  }
}

main();
