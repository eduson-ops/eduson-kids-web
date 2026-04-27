import { AnthropicProvider } from '../src/modules/lessons/providers/anthropic.provider';

/**
 * Unit tests for AnthropicProvider.
 *
 * - Throws when API key missing
 * - Cost calculator produces expected kopecks for known token fixture
 * - Parses tool-use response into LessonGenerationOutput shape
 * - Maps network errors into clear messages
 *
 * fetch() is monkey-patched per-test; we never hit a real Anthropic endpoint.
 */

function makeProvider(opts: { apiKey?: string; timeoutMs?: number } = {}): AnthropicProvider {
  const config: any = {
    get: (k: string) => {
      if (k === 'ANTHROPIC_API_KEY') return opts.apiKey;
      if (k === 'ANTHROPIC_TIMEOUT_MS') return opts.timeoutMs?.toString();
      return undefined;
    },
  };
  // Defensively ensure env doesn't leak a key into the test.
  delete process.env['ANTHROPIC_API_KEY'];
  delete process.env['ANTHROPIC_TIMEOUT_MS'];
  return new AnthropicProvider(config);
}

// Standard tool_use response factory used by retry tests.
function okToolUseBody() {
  return {
    id: 'msg_ok',
    type: 'message',
    role: 'assistant',
    model: 'claude-opus-4-7',
    content: [
      {
        type: 'tool_use',
        id: 't1',
        name: 'generate_lesson',
        input: {
          title: 'OK',
          plan: { steps: [] },
          teacherGuide: '',
          quiz: [],
          homework: { description: '' },
        },
      },
    ],
    stop_reason: 'tool_use',
    usage: { input_tokens: 10, output_tokens: 10 },
  };
}

function makeFetchResponse(opts: {
  ok: boolean;
  status: number;
  statusText?: string;
  body?: any;
  retryAfter?: string;
}) {
  const headers = new Map<string, string>();
  if (opts.retryAfter) headers.set('retry-after', opts.retryAfter);
  return {
    ok: opts.ok,
    status: opts.status,
    statusText: opts.statusText ?? '',
    headers: { get: (k: string) => headers.get(k.toLowerCase()) ?? null },
    json: async () => opts.body ?? {},
    text: async () => (typeof opts.body === 'string' ? opts.body : JSON.stringify(opts.body ?? {})),
  };
}

describe('AnthropicProvider — config', () => {
  it('throws when ANTHROPIC_API_KEY not configured', async () => {
    const provider = makeProvider({});
    await expect(
      provider.generateLesson({
        topicCode: '1.2.3',
        grade: 5,
        umk: 'bosova',
        focus: 'blocks',
      }),
    ).rejects.toThrow(/ANTHROPIC_API_KEY/i);
  });

  it('exposes name = "anthropic"', () => {
    const provider = makeProvider({ apiKey: 'sk-x' });
    expect(provider.name).toBe('anthropic');
  });
});

describe('AnthropicProvider — successful response parsing', () => {
  let originalFetch: any;
  beforeEach(() => {
    originalFetch = global.fetch;
  });
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('parses tool_use block into LessonGenerationOutput shape', async () => {
    const provider = makeProvider({ apiKey: 'sk-test' });
    const fakePayload = {
      title: 'Алгоритмы и блоки',
      plan: {
        steps: [
          { title: 'Введение', durationMin: 5, description: 'Постановка' },
          { title: 'Объяснение', durationMin: 10, description: 'Концепты' },
          { title: 'Практика', durationMin: 15, description: 'Кодинг' },
        ],
      },
      teacherGuide: 'Подсказки',
      quiz: [
        { question: 'Q1?', options: ['a', 'b'], correctIndex: 0 },
        { question: 'Q2?', options: ['x', 'y'], correctIndex: 1 },
        { question: 'Q3?', options: ['m', 'n'], correctIndex: 0 },
      ],
      homework: { description: 'Сделать задание 5' },
    };

    global.fetch = jest.fn(async () => ({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        id: 'msg_x',
        type: 'message',
        role: 'assistant',
        model: 'claude-opus-4-7',
        content: [
          { type: 'tool_use', id: 't1', name: 'generate_lesson', input: fakePayload },
        ],
        stop_reason: 'tool_use',
        usage: {
          input_tokens: 200,
          output_tokens: 1500,
          cache_creation_input_tokens: 0,
          cache_read_input_tokens: 800,
        },
      }),
      text: async () => '',
    })) as any;

    const out = await provider.generateLesson({
      topicCode: '1.2.3',
      grade: 5,
      umk: 'bosova',
      focus: 'blocks',
    });

    expect(out.title).toBe('Алгоритмы и блоки');
    expect(out.payload.plan.steps).toHaveLength(3);
    expect(out.payload.quiz).toHaveLength(3);
    expect(out.payload.meta.provider).toBe('anthropic');
    expect(out.payload.meta.model).toBe('claude-opus-4-7');
    expect(out.payload.meta.tokensUsed).toBe(200 + 1500 + 800);
    expect(out.costKopecks).toBeGreaterThan(0);
  });

  it('costKopecks calculation matches known token fixture', async () => {
    // input=200 (200/1000 * 50 = 10), output=1500 (1.5*200=300),
    // cacheRead=800 (0.8*5=4) → total = 314 kopecks (rounded up).
    const provider = makeProvider({ apiKey: 'sk-test' });
    global.fetch = jest.fn(async () => ({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        id: 'msg_x',
        type: 'message',
        role: 'assistant',
        model: 'claude-opus-4-7',
        content: [
          {
            type: 'tool_use',
            id: 't1',
            name: 'generate_lesson',
            input: {
              title: 'T',
              plan: { steps: [] },
              teacherGuide: '',
              quiz: [],
              homework: { description: '' },
            },
          },
        ],
        stop_reason: 'tool_use',
        usage: {
          input_tokens: 200,
          output_tokens: 1500,
          cache_creation_input_tokens: 0,
          cache_read_input_tokens: 800,
        },
      }),
      text: async () => '',
    })) as any;

    const out = await provider.generateLesson({
      topicCode: '1.2.3',
      grade: 5,
      umk: 'bosova',
      focus: 'blocks',
    });
    expect(out.costKopecks).toBe(314);
  });

  it('throws clear error when tool_use block missing', async () => {
    const provider = makeProvider({ apiKey: 'sk-test' });
    global.fetch = jest.fn(async () => ({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        id: 'msg_y',
        type: 'message',
        role: 'assistant',
        model: 'claude-opus-4-7',
        content: [{ type: 'text', text: 'Sorry, I cannot.' }],
        stop_reason: 'end_turn',
      }),
      text: async () => '',
    })) as any;

    await expect(
      provider.generateLesson({
        topicCode: '1.2.3',
        grade: 5,
        umk: 'bosova',
        focus: 'blocks',
      }),
    ).rejects.toThrow(/missing generate_lesson tool_use/i);
  });
});

describe('AnthropicProvider — error mapping', () => {
  let originalFetch: any;
  beforeEach(() => {
    originalFetch = global.fetch;
  });
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('wraps network failure with helpful context (after retries exhausted)', async () => {
    // Tight total-timeout cap so the retry budget burns down quickly without
    // waiting the full 60s default.
    const provider = makeProvider({ apiKey: 'sk-test', timeoutMs: 1000 });
    global.fetch = jest.fn(async () => {
      throw new Error('ECONNREFUSED');
    }) as any;
    await expect(
      provider.generateLesson({
        topicCode: '1.2.3',
        grade: 5,
        umk: 'bosova',
        focus: 'blocks',
      }),
    ).rejects.toThrow(/(network error.*ECONNREFUSED|aborted after 1000ms)/i);
  }, 15000);

  it('surfaces non-retryable 4xx status with body excerpt (no retry)', async () => {
    const provider = makeProvider({ apiKey: 'sk-test' });
    const fetchSpy = jest.fn(async () =>
      makeFetchResponse({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        body: 'invalid model',
      }),
    );
    global.fetch = fetchSpy as any;
    await expect(
      provider.generateLesson({
        topicCode: '1.2.3',
        grade: 5,
        umk: 'bosova',
        focus: 'blocks',
      }),
    ).rejects.toThrow(/Anthropic API 400.*invalid model/);
    // 4xx (non-429) must be deterministic — exactly one fetch call.
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});

describe('AnthropicProvider — retry on 429 / 5xx', () => {
  let originalFetch: any;
  beforeEach(() => {
    originalFetch = global.fetch;
  });
  afterEach(() => {
    global.fetch = originalFetch;
    jest.useRealTimers();
  });

  it('retries on 429 then succeeds', async () => {
    const provider = makeProvider({ apiKey: 'sk-test' });
    let callCount = 0;
    const fetchSpy = jest.fn(async () => {
      callCount++;
      if (callCount === 1) {
        return makeFetchResponse({
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
          body: 'rate limited',
          retryAfter: '0', // Header present but 0 → minimal backoff
        });
      }
      return makeFetchResponse({ ok: true, status: 200, body: okToolUseBody() });
    });
    global.fetch = fetchSpy as any;

    const out = await provider.generateLesson({
      topicCode: '1.2.3',
      grade: 5,
      umk: 'bosova',
      focus: 'blocks',
    });
    expect(out.title).toBe('OK');
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('retries on 503 then succeeds', async () => {
    const provider = makeProvider({ apiKey: 'sk-test' });
    let callCount = 0;
    const fetchSpy = jest.fn(async () => {
      callCount++;
      if (callCount < 3) {
        return makeFetchResponse({
          ok: false,
          status: 503,
          statusText: 'Service Unavailable',
          body: 'overloaded',
          retryAfter: '0',
        });
      }
      return makeFetchResponse({ ok: true, status: 200, body: okToolUseBody() });
    });
    global.fetch = fetchSpy as any;

    const out = await provider.generateLesson({
      topicCode: '1.2.3',
      grade: 5,
      umk: 'bosova',
      focus: 'blocks',
    });
    expect(out.title).toBe('OK');
    expect(fetchSpy).toHaveBeenCalledTimes(3);
  });

  it('honors Retry-After header (numeric seconds)', async () => {
    const provider = makeProvider({ apiKey: 'sk-test' });
    let callCount = 0;
    const fetchSpy = jest.fn(async () => {
      callCount++;
      if (callCount === 1) {
        return makeFetchResponse({
          ok: false,
          status: 429,
          body: 'slow down',
          retryAfter: '2', // 2 seconds
        });
      }
      return makeFetchResponse({ ok: true, status: 200, body: okToolUseBody() });
    });
    global.fetch = fetchSpy as any;

    const t0 = Date.now();
    const out = await provider.generateLesson({
      topicCode: '1.2.3',
      grade: 5,
      umk: 'bosova',
      focus: 'blocks',
    });
    const elapsed = Date.now() - t0;
    expect(out.title).toBe('OK');
    // Should have waited at least ~1.5s (Retry-After=2s, allow some slack)
    expect(elapsed).toBeGreaterThanOrEqual(1500);
    expect(elapsed).toBeLessThan(5000);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  }, 15000);

  it('does NOT retry on 4xx other than 429', async () => {
    const provider = makeProvider({ apiKey: 'sk-test' });
    const fetchSpy = jest.fn(async () =>
      makeFetchResponse({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        body: 'bad key',
      }),
    );
    global.fetch = fetchSpy as any;

    await expect(
      provider.generateLesson({
        topicCode: '1.2.3',
        grade: 5,
        umk: 'bosova',
        focus: 'blocks',
      }),
    ).rejects.toThrow(/Anthropic API 401/);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('total timeout aborts retry loop', async () => {
    // 500ms total cap. 429 with retry-after=10s → first backoff exceeds budget.
    const provider = makeProvider({ apiKey: 'sk-test', timeoutMs: 500 });
    const fetchSpy = jest.fn(async () =>
      makeFetchResponse({
        ok: false,
        status: 429,
        body: 'rate limited',
        retryAfter: '10',
      }),
    );
    global.fetch = fetchSpy as any;

    const t0 = Date.now();
    await expect(
      provider.generateLesson({
        topicCode: '1.2.3',
        grade: 5,
        umk: 'bosova',
        focus: 'blocks',
      }),
    ).rejects.toThrow(/aborted after 500ms/);
    const elapsed = Date.now() - t0;
    // Should bail out close to the timeout, not wait the full 10s retry-after.
    expect(elapsed).toBeLessThan(2000);
  }, 10000);

  it('persists rawResponse on successful generation (truncated <=64KB)', async () => {
    const provider = makeProvider({ apiKey: 'sk-test' });
    const body = okToolUseBody();
    global.fetch = jest.fn(async () =>
      makeFetchResponse({ ok: true, status: 200, body }),
    ) as any;

    const out = await provider.generateLesson({
      topicCode: '1.2.3',
      grade: 5,
      umk: 'bosova',
      focus: 'blocks',
    });
    expect(out.rawResponse).toBeDefined();
    // Small response — should pass through untruncated.
    expect((out.rawResponse as any).id).toBe('msg_ok');
    expect((out.rawResponse as any)._truncated).toBeUndefined();
  });

  it('truncates oversized rawResponse with marker', async () => {
    const provider = makeProvider({ apiKey: 'sk-test' });
    const huge = 'x'.repeat(70 * 1024); // > 64KB
    const body = { ...okToolUseBody(), bigField: huge };
    global.fetch = jest.fn(async () =>
      makeFetchResponse({ ok: true, status: 200, body }),
    ) as any;

    const out = await provider.generateLesson({
      topicCode: '1.2.3',
      grade: 5,
      umk: 'bosova',
      focus: 'blocks',
    });
    expect((out.rawResponse as any)._truncated).toBe(true);
    expect((out.rawResponse as any)._maxBytes).toBe(64 * 1024);
  });
});
