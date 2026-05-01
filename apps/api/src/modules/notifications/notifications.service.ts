import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './notification.entity';

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  slotId?: string;
  dedupKey?: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
  ) {}

  async create(dto: CreateNotificationDto): Promise<Notification | null> {
    if (dto.dedupKey) {
      const exists = await this.repo.findOne({ where: { dedupKey: dto.dedupKey } });
      if (exists) return null;
    }
    const n = this.repo.create({
      userId: dto.userId,
      type: dto.type,
      title: dto.title,
      body: dto.body,
      slotId: dto.slotId ?? null,
      dedupKey: dto.dedupKey ?? null,
    });
    return this.repo.save(n);
  }

  async findForUser(userId: string): Promise<Notification[]> {
    return this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async markRead(id: string, userId: string): Promise<void> {
    await this.repo.update({ id, userId }, { read: true });
  }

  async markAllRead(userId: string): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .update()
      .set({ read: true })
      .where('user_id = :userId AND read = false', { userId })
      .execute();
  }

  async countUnread(userId: string): Promise<number> {
    return this.repo.count({ where: { userId, read: false } });
  }
}
