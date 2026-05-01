import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { NotificationsService } from './notifications.service';
import { ScheduleSlot, SlotStatus } from '../schedule/schedule-slot.entity';

@Injectable()
export class NotificationsCronService {
  private readonly logger = new Logger(NotificationsCronService.name);

  constructor(
    private readonly notifications: NotificationsService,
    @InjectRepository(ScheduleSlot)
    private readonly slotsRepo: Repository<ScheduleSlot>,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async sendLessonReminders() {
    const now = new Date();

    // 24h reminder window: slots starting 23h–25h from now
    const win24Start = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const win24End   = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    // 1h reminder window: slots starting 50–70 min from now
    const win1hStart = new Date(now.getTime() + 50 * 60 * 1000);
    const win1hEnd   = new Date(now.getTime() + 70 * 60 * 1000);

    const slots24h = await this.slotsRepo.find({
      where: { status: SlotStatus.SCHEDULED, datetime: Between(win24Start, win24End) },
    });

    const slots1h = await this.slotsRepo.find({
      where: { status: SlotStatus.SCHEDULED, datetime: Between(win1hStart, win1hEnd) },
    });

    let sent = 0;

    for (const slot of slots24h) {
      if (!slot.studentId) continue;
      const dt = new Date(slot.datetime).toLocaleString('ru-RU', {
        day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Moscow',
      });
      const result = await this.notifications.create({
        userId: slot.studentId,
        type: 'lesson_reminder_24h',
        title: 'Занятие завтра',
        body: `Завтра в ${dt} (МСК) у тебя занятие. Не забудь войти по ссылке!`,
        slotId: slot.id,
        dedupKey: `24h:${slot.id}`,
      });
      if (result) {
        sent++;
        // Also notify teacher
        await this.notifications.create({
          userId: slot.teacherId,
          type: 'lesson_reminder_24h',
          title: 'Занятие завтра',
          body: `Завтра в ${dt} (МСК) запланировано занятие.`,
          slotId: slot.id,
          dedupKey: `24h:teacher:${slot.id}`,
        });
      }
    }

    for (const slot of slots1h) {
      if (!slot.studentId) continue;
      const dt = new Date(slot.datetime).toLocaleString('ru-RU', {
        hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Moscow',
      });
      const result = await this.notifications.create({
        userId: slot.studentId,
        type: 'lesson_reminder_1h',
        title: 'Занятие через час',
        body: `В ${dt} (МСК) начнётся твоё занятие. Приготовься!`,
        slotId: slot.id,
        dedupKey: `1h:${slot.id}`,
      });
      if (result) {
        sent++;
        await this.notifications.create({
          userId: slot.teacherId,
          type: 'lesson_reminder_1h',
          title: 'Занятие через час',
          body: `В ${dt} (МСК) начнётся занятие с учеником.`,
          slotId: slot.id,
          dedupKey: `1h:teacher:${slot.id}`,
        });
      }
    }

    if (sent > 0) {
      this.logger.log(`Sent ${sent} lesson reminder notification(s)`);
    }
  }
}
