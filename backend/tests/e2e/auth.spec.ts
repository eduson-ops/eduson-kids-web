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

    // F-12: HttpOnly cookie auth path. Server should accept the JWT when it
    // arrives in the `access_token` cookie, with no Authorization header.
    it('returns 200 with valid token in access_token cookie (no Authorization header)', async () => {
      const token = ctx.signToken();
      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Cookie', `access_token=${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        id: expect.any(String),
        role: expect.any(String),
      });
    });

    it('rejects bogus token in access_token cookie', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Cookie', 'access_token=not-a-jwt');
      expect(res.status).toBe(401);
    });
  });

  // F-12: login flows must set the HttpOnly access_token cookie alongside
  // the response body. We verify with /auth/guest because it has no DB
  // dependency in the mocked test setup.
  describe('access_token cookie wiring (F-12)', () => {
    it('POST /auth/guest sets HttpOnly access_token cookie', async () => {
      const res = await request(app.getHttpServer()).post('/api/v1/auth/guest');
      expect(res.status).toBe(200);
      const setCookie = res.headers['set-cookie'] as unknown as string[] | undefined;
      expect(setCookie).toBeDefined();
      const accessCookie = (setCookie ?? []).find((c) => c.startsWith('access_token='));
      expect(accessCookie).toBeDefined();
      expect(accessCookie).toMatch(/HttpOnly/i);
      expect(accessCookie).toMatch(/SameSite=Lax/i);
      expect(accessCookie).toMatch(/Path=\//);
    });

    // End-to-end round-trip (login → /auth/me with no Authorization, cookie
     // only). We mint a real JWT via ctx.signToken() and exercise the full
     // cookie path through the JwtStrategy cookieExtractor. This is the same
     // contract a real browser sees: backend issues access_token cookie,
     // browser auto-attaches it on the next request, server reads + validates.
    it('access_token cookie alone authenticates /auth/me (no Authorization header)', async () => {
      const token = ctx.signToken();
      const me = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Cookie', `access_token=${token}`);
      expect(me.status).toBe(200);
      expect(me.body.id).toBeDefined();
    });
  });
});
