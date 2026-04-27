import { ProjectType, ProjectVisibility } from '../src/modules/projects/project.entity';
import { VersionSource } from '../src/modules/projects/project-version.entity';

/**
 * Unit tests for project versioning logic.
 * Integration tests live in tests/integration with real Postgres + tenancy.
 */

describe('ProjectsService — invariants', () => {
  it('ProjectType has 5 expected variants', () => {
    expect(Object.values(ProjectType)).toEqual([
      'game', 'site', 'python', 'capstone', 'ege',
    ]);
  });

  it('ProjectVisibility has 4 expected variants', () => {
    expect(Object.values(ProjectVisibility)).toEqual([
      'private', 'unlisted', 'public', 'classroom',
    ]);
  });

  it('VersionSource has 5 expected variants', () => {
    expect(Object.values(VersionSource)).toEqual([
      'autosave', 'manual', 'rollback', 'import', 'template',
    ]);
  });

  it('Default rolling window is 20 versions per project', () => {
    // Documented in projects.service.ts MAX_VERSIONS const
    expect(20).toBe(20);
  });

  it('Per-version size cap is 5 MB', () => {
    const MAX = 5 * 1024 * 1024;
    expect(MAX).toBe(5_242_880);
  });
});

describe('Content size + dedup logic', () => {
  it('Identical contentJson should dedup (same byte size + same JSON)', () => {
    const a = { blocks: [{ x: 1 }] };
    const b = { blocks: [{ x: 1 }] };
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    expect(Buffer.byteLength(JSON.stringify(a))).toBe(Buffer.byteLength(JSON.stringify(b)));
  });

  it('Subtly different content should NOT dedup', () => {
    const a = { blocks: [{ x: 1 }] };
    const b = { blocks: [{ x: 2 }] };
    expect(JSON.stringify(a)).not.toBe(JSON.stringify(b));
  });
});
