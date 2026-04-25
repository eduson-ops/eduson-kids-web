import { SferumLinkService } from '../src/modules/auth/strategies/sferum-link.service';
import { UserRole } from '../src/modules/auth/entities/user.entity';

/**
 * Unit tests for SferumLinkService — code resolution + class join.
 *
 * Repositories are simple in-memory fakes. JwtService and ConfigService are
 * mocked. No DB / Postgres / Redis.
 */

const TENANT_ID = '11111111-1111-1111-1111-111111111111';
const TEACHER_ID = '22222222-2222-2222-2222-222222222222';

function makeService(opts: { archived?: boolean; classCode?: string } = {}) {
  const classroomsStore = new Map<string, any>();
  const usersStore = new Map<string, any>();

  if (opts.classCode) {
    classroomsStore.set('cls-1', {
      id: 'cls-1',
      tenantId: TENANT_ID,
      teacherId: TEACHER_ID,
      inviteCode: opts.classCode,
      isArchived: opts.archived ?? false,
    });
  }

  const classroomsRepo: any = {
    findOne: jest.fn(async ({ where }: any) => {
      const arr = [...classroomsStore.values()];
      return arr.find((r) => {
        for (const [k, v] of Object.entries(where)) {
          if (r[k] !== v) return false;
        }
        return true;
      }) ?? null;
    }),
    update: jest.fn(async (id: string, patch: any) => {
      const r = classroomsStore.get(id);
      if (r) Object.assign(r, patch);
      return { affected: r ? 1 : 0 };
    }),
    _store: classroomsStore,
  };

  const usersRepo: any = {
    create: (e: any) => ({ ...e }),
    save: jest.fn(async (e: any) => {
      if (!e.id) e.id = `u-${usersStore.size + 1}`;
      usersStore.set(e.id, e);
      return e;
    }),
    count: jest.fn(async () => 0),
    _store: usersStore,
  };

  const config: any = {
    get: (k: string) => {
      if (k === 'jwt.accessSecret') return 'test-access-secret-32chars-long-xx';
      if (k === 'jwt.refreshSecret') return 'test-refresh-secret-32chars-long-x';
      return undefined;
    },
  };

  const jwt: any = {
    sign: jest.fn((payload: any) => `signed:${JSON.stringify(payload).slice(0, 30)}`),
  };

  const tenantContext: any = {
    require: () => ({ tenantId: TENANT_ID, bypass: false }),
  };

  return {
    service: new SferumLinkService(classroomsRepo, usersRepo, config, jwt, tenantContext),
    classroomsRepo,
    usersRepo,
    jwt,
  };
}

describe('SferumLinkService.resolveClassCode', () => {
  it('returns null for empty code', async () => {
    const { service } = makeService();
    expect(await service.resolveClassCode('')).toBeNull();
  });

  it('returns null for code with invalid characters', async () => {
    const { service } = makeService();
    expect(await service.resolveClassCode('abc!def')).toBeNull();
  });

  it('returns null for too-short code (< 6 chars)', async () => {
    const { service } = makeService();
    expect(await service.resolveClassCode('ab23')).toBeNull();
  });

  it('returns null when classroom is archived', async () => {
    const { service } = makeService({ classCode: 'abc23xyz', archived: true });
    expect(await service.resolveClassCode('abc23xyz')).toBeNull();
  });

  it('returns classroom when code valid and not archived', async () => {
    const { service } = makeService({ classCode: 'abc23xyz', archived: false });
    const found = await service.resolveClassCode('abc23xyz');
    expect(found).toBeDefined();
    expect(found?.id).toBe('cls-1');
  });

  it('lowercases and trims input', async () => {
    const { service } = makeService({ classCode: 'abc23xyz', archived: false });
    const found = await service.resolveClassCode('  ABC23XYZ  ');
    expect(found?.id).toBe('cls-1');
  });
});

describe('SferumLinkService.issueClassCode', () => {
  it('generates 8 chars from confusion-free alphabet', async () => {
    const { service } = makeService({ classCode: 'aaa11111', archived: false });
    const code = await service.issueClassCode('cls-1', TEACHER_ID);
    expect(code).toHaveLength(8);
    // Check no banned chars in alphabet (no o, l, j, i, 0, 1)
    const ALPHABET = 'abcdefghkmnpqrstuvwxyz23456789';
    for (const c of code) {
      expect(ALPHABET).toContain(c);
    }
  });
});

describe('SferumLinkService.quickJoinAsChild', () => {
  it('rejects with NotFound when class code unknown', async () => {
    const { service } = makeService();
    await expect(service.quickJoinAsChild('unknown1', 'Petya')).rejects.toThrow(
      /Invalid or expired class code/,
    );
  });

  it('creates a CHILD user with correct tenant + login pattern', async () => {
    const { service, usersRepo } = makeService({
      classCode: 'cls12345',
      archived: false,
    });
    const result = await service.quickJoinAsChild('cls12345', 'Petya');
    expect(result.tenantId).toBe(TENANT_ID);
    expect(result.classroomId).toBe('cls-1');
    expect(result.user.login).toMatch(/^sf_cls12345_\d{4}$/);
    expect(usersRepo.save).toHaveBeenCalled();
    const saved = (usersRepo.save as jest.Mock).mock.calls[0][0];
    expect(saved.role).toBe(UserRole.CHILD);
    expect(saved.tenantId).toBe(TENANT_ID);
    expect(saved.externalIds).toEqual({ sferum: 'cls12345:Petya' });
  });
});
