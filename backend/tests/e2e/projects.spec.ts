/**
 * E2E smoke tests — projects routing/auth contract.
 *
 * ProjectsService is mocked. The real service requires Postgres + RLS +
 * tenant context — that path will be exercised in tests/integration when
 * docker-compose is available (next sprint, B-15+). Here we verify:
 *   - JWT guard wiring on /projects routes
 *   - DTO validation accepts a happy-path body
 *   - Mocked service returns the expected shape end-to-end
 */
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createApp, TestContext } from './setup';

describe('E2E: /api/v1/projects', () => {
  let ctx: TestContext;
  let app: INestApplication;

  beforeAll(async () => {
    ctx = await createApp();
    app = ctx.app;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /projects', () => {
    it('returns 401 without auth', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/projects')
        .send({ name: 'Untitled', type: 'game' });
      expect(res.status).toBe(401);
    });

    it('returns 201 with auth + valid body', async () => {
      const token = ctx.signToken();
      const res = await request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'My First Game', type: 'game' });
      // Nest defaults POST to 201
      expect([200, 201]).toContain(res.status);
      expect(res.body).toMatchObject({
        id: expect.any(String),
        name: 'My First Game',
        type: 'game',
      });
    });

    it('returns 400 on invalid type enum', async () => {
      const token = ctx.signToken();
      const res = await request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Bad', type: 'not-a-valid-type' });
      expect(res.status).toBe(400);
    });

    it('returns 400 with missing name', async () => {
      const token = ctx.signToken();
      const res = await request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ type: 'game' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /projects', () => {
    it('returns 401 without auth', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/projects');
      expect(res.status).toBe(401);
    });

    it('returns 200 + array with auth', async () => {
      const token = ctx.signToken();
      const res = await request(app.getHttpServer())
        .get('/api/v1/projects')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  // Real DB-backed end-to-end (RLS + JSONB + version chain) — runs once
  // a Postgres harness is wired in. Marked as todo so it shows up in reports.
  it.todo('persists a project version chain across saves (needs real PG)');
  it.todo('rolls back to a prior version (needs real PG)');
  it.todo('soft-delete + restore round-trip (needs real PG)');
});
