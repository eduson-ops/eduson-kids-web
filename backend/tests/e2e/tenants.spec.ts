/**
 * E2E smoke tests — tenant management contract.
 *
 * Verifies:
 *   - GET /tenants/me is anon-allowed and returns the active tenant shape
 *   - POST /tenants requires the system-bypass JWT claim (sys: true)
 *
 * TenantsService is mocked; TenantContext is stubbed to a default tenant.
 */
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createApp, TestContext, TEST_TENANT_ID } from './setup';

describe('E2E: /api/v1/tenants', () => {
  let ctx: TestContext;
  let app: INestApplication;

  beforeAll(async () => {
    ctx = await createApp();
    app = ctx.app;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /tenants/me', () => {
    it('returns 200 + public tenant shape (slug, name, branding)', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/tenants/me');
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        id: TEST_TENANT_ID,
        slug: expect.any(String),
        name: expect.any(String),
        branding: expect.any(Object),
        featureFlags: expect.any(Object),
      });
      // Quotas / parent must NOT leak
      expect(res.body.quotas).toBeUndefined();
      expect(res.body.parentTenantId).toBeUndefined();
    });
  });

  describe('POST /tenants', () => {
    it('returns 401 without auth', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/tenants')
        .send({ slug: 'new-tenant', name: 'New' });
      expect(res.status).toBe(401);
    });

    it('returns 403 with non-system token', async () => {
      const token = ctx.signToken({ sys: false });
      // ensure stub tenant context reflects bypass=false
      (ctx.tenantContext as unknown as { setBypass: (b: boolean) => void }).setBypass(false);
      const res = await request(app.getHttpServer())
        .post('/api/v1/tenants')
        .set('Authorization', `Bearer ${token}`)
        .send({ slug: 'new-tenant', name: 'New' });
      expect(res.status).toBe(403);
    });
  });
});
