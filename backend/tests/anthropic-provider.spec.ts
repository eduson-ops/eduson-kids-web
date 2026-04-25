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

function makeProvider(opts: { apiKey?: string } = {}): AnthropicProvider {
  const config: any = {
    get: (k: string) => {
      if (k === 'ANTHROPIC_API_KEY') return opts.apiKey;
      return undefined;
    },
  };
  // Defensively ensure env doesn't leak a key into the test.
  delete process.env['ANTHROPIC_API_KEY'];
  return new AnthropicProvider(config);
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

  it('wraps network failure with helpful context', async () => {
    const provider = makeProvider({ apiKey: 'sk-test' });
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
    ).rejects.toThrow(/network error.*ECONNREFUSED/i);
  });

  it('surfaces non-2xx status with body excerpt', async () => {
    const provider = makeProvider({ apiKey: 'sk-test' });
    global.fetch = jest.fn(async () => ({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      json: async () => ({}),
      text: async () => 'rate limited',
    })) as any;
    await expect(
      provider.generateLesson({
        topicCode: '1.2.3',
        grade: 5,
        umk: 'bosova',
        focus: 'blocks',
      }),
    ).rejects.toThrow(/Anthropic API 429.*rate limited/);
  });
});
