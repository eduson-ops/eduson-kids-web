import { UserRole } from '../src/modules/auth/entities/user.entity';
import { LessonStatus, LessonUmk, LessonFocus } from '../src/modules/lessons/lesson.entity';
import { LessonVersionSource } from '../src/modules/lessons/lesson-version.entity';

/**
 * Compile-time + invariant checks for admin and lessons modules.
 * Real RBAC tests + AI pipeline tests live in tests/integration with a real DB.
 */
describe('UserRole hierarchy', () => {
  it('exposes all 8 roles', () => {
    const roles = Object.values(UserRole);
    expect(roles).toHaveLength(8);
    expect(roles).toContain(UserRole.PLATFORM_ADMIN);
    expect(roles).toContain(UserRole.METHODIST);
    expect(roles).toContain(UserRole.CHILD);
  });
});

describe('LessonStatus state machine', () => {
  it('exposes 6 valid lifecycle states', () => {
    const valid = Object.values(LessonStatus);
    expect(valid).toEqual(['queued', 'generating', 'pending_review', 'published', 'rejected', 'failed']);
  });
});

describe('LessonUmk + LessonFocus enums', () => {
  it('UMK includes 4 textbooks + generic', () => {
    expect(Object.values(LessonUmk)).toEqual(['bosova', 'polyakov', 'ugrinovich', 'semakin', 'generic']);
  });
  it('Focus has 4 tracks', () => {
    expect(Object.values(LessonFocus)).toEqual(['blocks', 'python', 'web', 'game']);
  });
});

describe('LessonVersionSource', () => {
  it('exposes 4 provenance markers', () => {
    expect(Object.values(LessonVersionSource)).toEqual([
      'ai_initial', 'ai_regenerate', 'methodist_edit', 'rollback',
    ]);
  });
});

describe('Mock AI provider contract', () => {
  it('Mock provider returns placeholder structure', async () => {
    const { MockAiProvider } = await import('../src/modules/lessons/providers/mock.provider');
    const provider = new MockAiProvider();
    const out = await provider.generateLesson({
      topicCode: '1.2.3',
      grade: 5,
      umk: 'bosova',
      focus: 'blocks',
    });
    expect(out.title).toContain('1.2.3');
    expect(out.payload.plan.steps.length).toBeGreaterThanOrEqual(3);
    expect(out.payload.quiz.length).toBeGreaterThanOrEqual(3);
    expect(out.costKopecks).toBe(0);
    expect(out.payload.meta.provider).toBe('mock');
  }, 5000);
});
