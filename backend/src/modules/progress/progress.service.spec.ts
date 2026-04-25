import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProgressService } from './progress.service';
import { ProgressEvent, ProgressEventKind } from './progress.entity';
import { User } from '../auth/entities/user.entity';

/**
 * Unit tests for D-05 SQL-aggregated buildSummary.
 *
 * The previous JS-side implementation pulled all 30-day events. We now group
 * by day in Postgres and assemble the summary from grouped rows. Tests mock
 * the QueryBuilder chain to verify the shape returned by getMySummary().
 */
describe('ProgressService.buildSummary (D-05 SQL aggregation)', () => {
  let service: ProgressService;
  let getRawMany: jest.Mock;

  beforeEach(async () => {
    getRawMany = jest.fn();
    const qb: Record<string, jest.Mock> = {} as Record<string, jest.Mock>;
    const chain = (k: string) => {
      qb[k] = jest.fn().mockReturnValue(qb);
      return qb;
    };
    chain('select');
    chain('addSelect');
    chain('where');
    chain('andWhere');
    chain('setParameters');
    chain('groupBy');
    chain('orderBy');
    qb.getRawMany = getRawMany;

    const progressRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(qb),
    };
    const userRepo = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressService,
        { provide: getRepositoryToken(ProgressEvent), useValue: progressRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
      ],
    }).compile();

    service = module.get(ProgressService);
  });

  it('returns zero-filled summary when no rows', async () => {
    getRawMany.mockResolvedValue([]);
    const out = await service.getMySummary('u1');
    expect(out).toEqual({
      coins: 0,
      streak: 0,
      lessonsCompleted: 0,
      puzzlesCompleted: 0,
      weeklyHeatmap: {},
    });
  });

  it('aggregates lessons, puzzles, and coins from grouped rows', async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    getRawMany.mockResolvedValue([
      { day: today, lessons: '3', puzzles: '2', coins: '15', events: '5' },
    ]);
    const out = await service.getMySummary('u1');
    expect(out.lessonsCompleted).toBe(3);
    expect(out.puzzlesCompleted).toBe(2);
    expect(out.coins).toBe(15);
    // Today should be in the 7-day heatmap
    const dayKey = today.toISOString().slice(0, 10);
    expect(out.weeklyHeatmap[dayKey]).toBe(5);
  });

  it('keeps weekly heatmap to last 7 days only', async () => {
    const old = new Date();
    old.setDate(old.getDate() - 20);
    old.setHours(0, 0, 0, 0);
    const recent = new Date();
    recent.setDate(recent.getDate() - 2);
    recent.setHours(0, 0, 0, 0);
    getRawMany.mockResolvedValue([
      { day: recent, lessons: '1', puzzles: '0', coins: '5', events: '1' },
      { day: old, lessons: '4', puzzles: '0', coins: '20', events: '4' },
    ]);
    const out = await service.getMySummary('u1');
    expect(out.lessonsCompleted).toBe(5); // 1 + 4
    expect(out.coins).toBe(25); // 5 + 20
    // Only the recent day appears in heatmap
    const recentKey = recent.toISOString().slice(0, 10);
    const oldKey = old.toISOString().slice(0, 10);
    expect(out.weeklyHeatmap[recentKey]).toBe(1);
    expect(out.weeklyHeatmap[oldKey]).toBeUndefined();
  });

  it('counts streak from contiguous days touching today', async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dayBefore = new Date(today);
    dayBefore.setDate(dayBefore.getDate() - 2);
    getRawMany.mockResolvedValue([
      { day: today, lessons: '1', puzzles: '0', coins: '0', events: '1' },
      { day: yesterday, lessons: '0', puzzles: '1', coins: '0', events: '1' },
      { day: dayBefore, lessons: '0', puzzles: '0', coins: '0', events: '1' },
    ]);
    const out = await service.getMySummary('u1');
    expect(out.streak).toBe(3);
  });

  it('accepts day as ISO string (pg driver fallback)', async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    getRawMany.mockResolvedValue([
      {
        day: today.toISOString(),
        lessons: 2,
        puzzles: 1,
        coins: 7,
        events: 3,
      },
    ]);
    const out = await service.getMySummary('u1');
    expect(out.lessonsCompleted).toBe(2);
    expect(out.puzzlesCompleted).toBe(1);
    expect(out.coins).toBe(7);
  });
});
