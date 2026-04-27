import { Test, TestingModule } from '@nestjs/testing';
import { TenantContext } from '../src/common/tenancy/tenant.context';
import { TenantTier, DEFAULT_TENANT_ID } from '../src/modules/tenants/tenant.entity';
import { defaultQuotas } from '../src/modules/tenants/tenants.service';

/**
 * Unit tests — multi-tenant context plumbing.
 * Integration tests (RLS, real Postgres) live separately under tests/integration.
 */
describe('TenantContext (AsyncLocalStorage)', () => {
  let ctx: TenantContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TenantContext],
    }).compile();
    ctx = module.get(TenantContext);
  });

  it('returns undefined outside scope', () => {
    expect(ctx.current()).toBeUndefined();
  });

  it('throws on require() outside scope', () => {
    expect(() => ctx.require()).toThrow(/no active tenant/i);
  });

  it('preserves tenant across async boundaries', async () => {
    const tenantId = '11111111-1111-1111-1111-111111111111';
    const result = await ctx.run({ tenantId }, async () => {
      await new Promise((r) => setImmediate(r));
      await new Promise((r) => setTimeout(r, 1));
      return ctx.require().tenantId;
    });
    expect(result).toBe(tenantId);
  });

  it('isolates tenants across concurrent runs', async () => {
    const a = '11111111-1111-1111-1111-111111111111';
    const b = '22222222-2222-2222-2222-222222222222';

    const [ra, rb] = await Promise.all([
      ctx.run({ tenantId: a }, async () => {
        await new Promise((r) => setTimeout(r, 5));
        return ctx.require().tenantId;
      }),
      ctx.run({ tenantId: b }, async () => {
        await new Promise((r) => setTimeout(r, 3));
        return ctx.require().tenantId;
      }),
    ]);

    expect(ra).toBe(a);
    expect(rb).toBe(b);
  });

  it('runAsSystem sets bypass=true and uses default tenant by default', async () => {
    const result = await ctx.runAsSystem(async () => ctx.require());
    expect(result.bypass).toBe(true);
    expect(result.tenantId).toBe(DEFAULT_TENANT_ID);
  });
});

describe('defaultQuotas() per tier', () => {
  it('B2C: max 3 students', () => {
    expect(defaultQuotas(TenantTier.B2C).maxStudents).toBe(3);
  });

  it('SCHOOL: 500 students, 30 classes', () => {
    const q = defaultQuotas(TenantTier.SCHOOL);
    expect(q.maxStudents).toBe(500);
    expect(q.maxClasses).toBe(30);
  });

  it('REGIONAL: 100k students, 6k classes, 5k AI lessons/month', () => {
    const q = defaultQuotas(TenantTier.REGIONAL);
    expect(q.maxStudents).toBe(100_000);
    expect(q.maxClasses).toBe(6_000);
    expect(q.maxAiLessonsPerMonth).toBe(5_000);
  });

  it('CORE: effectively unlimited', () => {
    const q = defaultQuotas(TenantTier.CORE);
    expect(q.maxStudents).toBeGreaterThanOrEqual(1_000_000);
  });
});
