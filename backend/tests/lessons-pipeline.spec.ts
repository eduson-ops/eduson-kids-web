import { AiPipelineService } from '../src/modules/lessons/ai-pipeline.service';
import {
  Lesson,
  LessonStatus,
  LessonUmk,
  LessonFocus,
} from '../src/modules/lessons/lesson.entity';
import { MockAiProvider } from '../src/modules/lessons/providers/mock.provider';
import { LessonGenerationInput } from '../src/modules/lessons/providers/ai-provider.interface';

/**
 * Unit tests for AiPipelineService — selection logic + quota gate +
 * status transitions. All dependencies are jest.fn() mocks; no DB / Redis.
 */

const TENANT_ID = '11111111-1111-1111-1111-111111111111';
const REQUESTER_ID = '22222222-2222-2222-2222-222222222222';

interface Harness {
  service: AiPipelineService;
  mockProvider: MockAiProvider;
  anthropicProvider: any;
  lessonsRepo: any;
  versionsRepo: any;
  config: any;
  tenantsService: any;
  tenantContext: any;
  dataSource: any;
}

function makeHarness(opts: {
  envProvider?: string;
  hasAnthropicKey?: boolean;
  monthlyQuota?: number;
  monthlyUsed?: number;
  monthlyCostKopecksUsed?: number;
  envCostCapKopecks?: number;
  tenantCostCapKopecks?: number;
} = {}): Harness {
  const lessonsStore = new Map<string, any>();
  const versionsStore = new Map<string, any>();

  const saveSnapshots: any[] = [];
  const lessonsRepo: any = {
    create: (e: any) => ({ ...e }),
    save: jest.fn(async (e: any) => {
      if (!e.id) e.id = `l-${lessonsStore.size + 1}`;
      lessonsStore.set(e.id, e);
      saveSnapshots.push({ ...e });
      return e;
    }),
    _saveSnapshots: saveSnapshots,
    update: jest.fn(async (id: string, patch: any) => {
      const r = lessonsStore.get(id);
      if (r) Object.assign(r, patch);
      return { affected: r ? 1 : 0 };
    }),
    findOne: jest.fn(async ({ where }: any) =>
      [...lessonsStore.values()].find((r) => r.id === where.id) ?? null,
    ),
    find: jest.fn(async () => [...lessonsStore.values()]),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getCount: jest.fn(async () => opts.monthlyUsed ?? 0),
      getRawOne: jest.fn(async () => ({ total: opts.monthlyCostKopecksUsed ?? 0 })),
    })),
    _store: lessonsStore,
  };

  const versionsRepo: any = {
    create: (e: any) => ({ ...e }),
    save: jest.fn(async (e: any) => {
      if (!e.id) e.id = `v-${versionsStore.size + 1}`;
      versionsStore.set(e.id, e);
      return e;
    }),
    findOne: jest.fn(async () => null),
    _store: versionsStore,
  };

  const dataSource = {
    transaction: jest.fn(async (fn: any) =>
      fn({
        findOne: lessonsRepo.findOne,
        create: (_e: any, d: any) => ({ ...d }),
        save: versionsRepo.save,
        update: lessonsRepo.update,
      }),
    ),
  };

  const tenantContext = {
    require: () => ({ tenantId: TENANT_ID, bypass: false }),
  };

  const tenantsService = {
    findById: jest.fn(async () => ({
      id: TENANT_ID,
      quotas: {
        maxAiLessonsPerMonth: opts.monthlyQuota ?? 0,
        ...(opts.tenantCostCapKopecks !== undefined
          ? { maxAiCostKopecks: opts.tenantCostCapKopecks }
          : {}),
      },
    })),
  };

  const configMap: Record<string, string | undefined> = {
    'ai.provider': opts.envProvider,
    ANTHROPIC_API_KEY: opts.hasAnthropicKey ? 'sk-test-key' : undefined,
    ANTHROPIC_MONTHLY_COST_KOPECKS_CAP:
      opts.envCostCapKopecks !== undefined ? String(opts.envCostCapKopecks) : undefined,
  };
  const config: any = {
    get: jest.fn((k: string) => configMap[k]),
  };

  const mockProvider = new MockAiProvider();
  const anthropicProvider: any = { name: 'anthropic', generateLesson: jest.fn() };

  const service = new AiPipelineService(
    lessonsRepo,
    versionsRepo,
    dataSource as any,
    tenantContext as any,
    tenantsService as any,
    config,
    mockProvider,
    anthropicProvider,
    null, // no queue
  );
  // Force in-process flow so submit() runs generation synchronously here.
  (service as any).useInProcessFallback = true;

  return {
    service,
    mockProvider,
    anthropicProvider,
    lessonsRepo,
    versionsRepo,
    config,
    tenantsService,
    tenantContext,
    dataSource,
  };
}

describe('AiPipelineService — provider selection', () => {
  it('Returns mock provider when AI_PROVIDER unset', () => {
    const h = makeHarness();
    const provider = (h.service as any).selectProvider();
    expect(provider.name).toBe('mock');
  });

  it('Returns anthropic provider when AI_PROVIDER=anthropic + key set', () => {
    const h = makeHarness({ envProvider: 'anthropic', hasAnthropicKey: true });
    const provider = (h.service as any).selectProvider();
    expect(provider.name).toBe('anthropic');
  });

  it('Falls back to mock when AI_PROVIDER=anthropic but key missing', () => {
    const h = makeHarness({ envProvider: 'anthropic', hasAnthropicKey: false });
    const provider = (h.service as any).selectProvider();
    expect(provider.name).toBe('mock');
  });

  it('Falls back to mock for unknown provider name', () => {
    const h = makeHarness({ envProvider: 'openai' });
    const provider = (h.service as any).selectProvider();
    expect(provider.name).toBe('mock');
  });
});

describe('AiPipelineService — quota gate', () => {
  const baseInput: LessonGenerationInput = {
    topicCode: '1.2.3',
    grade: 5,
    umk: 'bosova',
    focus: 'blocks',
  };

  it('Passes when monthlyQuota=0 (unlimited)', async () => {
    const h = makeHarness({ monthlyQuota: 0, monthlyUsed: 1000 });
    const lesson = await h.service.submit(REQUESTER_ID, baseInput);
    expect(lesson).toBeDefined();
    // Initial snapshot recorded at save() time (before async runGeneration mutates).
    const created = h.lessonsRepo._saveSnapshots[0];
    expect(created.status).toBe(LessonStatus.QUEUED);
  });

  it('Rejects when used >= monthly quota', async () => {
    const h = makeHarness({ monthlyQuota: 10, monthlyUsed: 10 });
    await expect(h.service.submit(REQUESTER_ID, baseInput)).rejects.toThrow(
      /quota exceeded/i,
    );
  });

  it('Permits when monthlyUsed < quota', async () => {
    const h = makeHarness({ monthlyQuota: 10, monthlyUsed: 9 });
    const lesson = await h.service.submit(REQUESTER_ID, baseInput);
    expect(lesson).toBeDefined();
  });
});

describe('AiPipelineService — status transitions', () => {
  it('Newly submitted lesson starts in QUEUED', async () => {
    const h = makeHarness({ monthlyQuota: 0 });
    await h.service.submit(REQUESTER_ID, {
      topicCode: '1.1.1',
      grade: 5,
      umk: 'bosova',
      focus: 'blocks',
    });
    // Inspect the row passed to repo.save (initial state, pre-runGeneration).
    const created = h.lessonsRepo._saveSnapshots[0];
    expect(created.status).toBe(LessonStatus.QUEUED);
    expect(created.tenantId).toBe(TENANT_ID);
    expect(created.umk).toBe(LessonUmk.BOSOVA);
    expect(created.focus).toBe(LessonFocus.BLOCKS);
  });

  it('Lesson lifecycle constants are correct', () => {
    expect(LessonStatus.QUEUED).toBe('queued');
    expect(LessonStatus.GENERATING).toBe('generating');
    expect(LessonStatus.PENDING_REVIEW).toBe('pending_review');
  });
});

describe('AiPipelineService — D2-14 per-tenant cost guard', () => {
  const baseInput: LessonGenerationInput = {
    topicCode: '1.2.3',
    grade: 5,
    umk: 'bosova',
    focus: 'blocks',
  };

  it('Rejects when monthly AI spend already exceeds env cap', async () => {
    const h = makeHarness({
      envCostCapKopecks: 10_000,
      monthlyCostKopecksUsed: 10_000,
    });
    await expect(h.service.submit(REQUESTER_ID, baseInput)).rejects.toThrow(
      /AI budget exceeded/i,
    );
  });

  it('Permits when spend below env cap', async () => {
    const h = makeHarness({
      envCostCapKopecks: 10_000,
      monthlyCostKopecksUsed: 5_000,
    });
    const lesson = await h.service.submit(REQUESTER_ID, baseInput);
    expect(lesson).toBeDefined();
  });

  it('Tenant cost cap overrides env cap (lower tenant cap rejects when env would allow)', async () => {
    const h = makeHarness({
      envCostCapKopecks: 100_000, // Generous env
      tenantCostCapKopecks: 1_000, // Tight tenant
      monthlyCostKopecksUsed: 1_000,
    });
    await expect(h.service.submit(REQUESTER_ID, baseInput)).rejects.toThrow(
      /AI budget exceeded.*1000\/1000/i,
    );
  });

  it('No cap configured → allows submit even with high spend', async () => {
    const h = makeHarness({ monthlyCostKopecksUsed: 1_000_000 });
    const lesson = await h.service.submit(REQUESTER_ID, baseInput);
    expect(lesson).toBeDefined();
  });
});
