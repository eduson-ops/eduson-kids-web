import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProgressEvent, ProgressEventKind } from './progress.entity';
import { User } from '../auth/entities/user.entity';

export interface ProgressSummary {
  coins: number;
  streak: number;
  lessonsCompleted: number;
  puzzlesCompleted: number;
  weeklyHeatmap: Record<string, number>;
}

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(ProgressEvent)
    private progressRepo: Repository<ProgressEvent>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async recordEvent(
    userId: string,
    kind: ProgressEventKind,
    payload: Record<string, unknown>,
  ): Promise<ProgressEvent> {
    const event = this.progressRepo.create({ userId, kind, payload });
    return this.progressRepo.save(event);
  }

  async getMySummary(userId: string): Promise<ProgressSummary> {
    return this.buildSummary(userId);
  }

  async getChildSummary(parentId: string, childId: string): Promise<ProgressSummary> {
    const parent = await this.userRepo.findOne({ where: { id: parentId } });
    if (!parent) throw new ForbiddenException('Access denied');

    const linked = parent.linkedChildIds ?? [];
    if (!linked.includes(childId)) {
      throw new ForbiddenException('Child not linked to this parent');
    }

    return this.buildSummary(childId);
  }

  private async buildSummary(userId: string): Promise<ProgressSummary> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const events = await this.progressRepo
      .createQueryBuilder('e')
      .where('e.userId = :userId', { userId })
      .andWhere('e.createdAt >= :since', { since: thirtyDaysAgo })
      .orderBy('e.createdAt', 'DESC')
      .getMany();

    const summary: ProgressSummary = {
      coins: 0,
      streak: 0,
      lessonsCompleted: 0,
      puzzlesCompleted: 0,
      weeklyHeatmap: {},
    };

    const streakDays = new Set<string>();

    for (const event of events) {
      const dayKey = event.createdAt.toISOString().slice(0, 10);
      streakDays.add(dayKey);

      if (event.kind === ProgressEventKind.COINS_EARNED) {
        summary.coins += (event.payload['amount'] as number) ?? 0;
      } else if (event.kind === ProgressEventKind.LESSON_SOLVED) {
        summary.lessonsCompleted++;
      } else if (event.kind === ProgressEventKind.PUZZLE_SOLVED) {
        summary.puzzlesCompleted++;
      }

      // Weekly heatmap: last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      if (event.createdAt >= sevenDaysAgo) {
        summary.weeklyHeatmap[dayKey] = (summary.weeklyHeatmap[dayKey] ?? 0) + 1;
      }
    }

    summary.streak = this.calculateStreak(streakDays);

    return summary;
  }

  private calculateStreak(days: Set<string>): number {
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      if (days.has(key)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return streak;
  }
}
