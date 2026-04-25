/**
 * E2E smoke tests — auth flow contract.
 *
 * AuthService is mocked (see setup.ts) — these tests verify the controller +
 * DTO validation layer, not argon2/Postgres/Redis. They assert:
 *   - guest flow returns a token
 *   - bad child credentials produce 401
 *   - /auth/me requires a valid Bearer token
 *   - /auth/me with valid token returns the user shape
 */
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createApp, TestContext } from './setup';

describe('E2E: /api/v1/auth', () => {
  let ctx: TestContext;
  let app: INestApplication;

  beforeAll(async () => {
    ctx = await createApp();
    app = ctx.app;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/guest', () => {
    it('returns 200 + accessToken (no body required)', async () => {
      const res = await request(app.getHttpServer()).post('/api/v1/auth/guest');
      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
      expect(typeof res.body.accessToken).toBe('string');
    });
  });

  describe('POST /auth/child/login', () => {
    it('returns 401 on bad credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/child/login')
        .send({ login: 'nonexistent-kid', pin: '000000' });
      expect(res.status).toBe(401);
    });

    it('returns 400 on malformed body (DTO validation)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/child/login')
        .send({ login: 'kid', pin: 'not-six-digits' });
      // class-validator catches the regex mismatch
      expect(res.status).toBe(400);
    });

    it('rejects unexpected fields (forbidNonWhitelisted)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/child/login')
        .send({ login: 'kid-name', pin: '123456', extra: 'evil' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /auth/me', () => {
    it('returns 401 without token', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
    });

    it('returns 401 with bogus token', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer not-a-real-jwt');
      expect(res.status).toBe(401);
    });

    it('returns 200 + user shape with valid token', async () => {
      const token = ctx.signToken();
      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        id: expect.any(String),
        role: expect.any(String),
        login: expect.any(String),
      });
    });
  });
});
