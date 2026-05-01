import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { ScheduleSlot } from '../schedule/schedule-slot.entity';
import { NotificationsService } from './notifications.service';
import { NotificationsCronService } from './notifications-cron.service';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, ScheduleSlot])],
  providers: [NotificationsService, NotificationsCronService],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}
