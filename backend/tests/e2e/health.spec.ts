/**
 * E2E smoke tests — health probes.
 *
 * Note: production HealthController depends on a real TypeORM DataSource and
 * Redis client (terminus indicators). In this no-docker environment we stub
 * the controller (see StubHealthController in setup.ts) and verify the HTTP
 * contract — routing, response shape, status codes. A future integration
 * sprint will replay these against the real controller with docker-compose.
 */
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createHealthApp } from './setup';

describe('E2E: /health', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createHealthApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health returns 200 with status ok', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok' });
  });

  it('GET /health/live returns 200 (liveness probe)', async () => {
    const res = await request(app.getHttpServer()).get('/health/live');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok' });
  });

  it('GET /health/ready returns 200 or 503 (readiness probe)', async () => {
    const res = await request(app.getHttpServer()).get('/health/ready');
    // In stub mode we always return 200; in real terminus mode 503 is also acceptable
    expect([200, 503]).toContain(res.status);
    expect(res.body.status).toBeDefined();
  });

  it('GET /health does NOT require auth', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });
});
