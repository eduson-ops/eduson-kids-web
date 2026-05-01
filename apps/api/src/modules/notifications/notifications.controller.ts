import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly svc: NotificationsService) {}

  @Get('my')
  async getMyNotifications(@CurrentUser() user: { id: string }) {
    return this.svc.findForUser(user.id);
  }

  @Get('my/unread-count')
  async getUnreadCount(@CurrentUser() user: { id: string }) {
    const count = await this.svc.countUnread(user.id);
    return { count };
  }

  @Patch(':id/read')
  async markRead(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    await this.svc.markRead(id, user.id);
    return { ok: true };
  }

  @Patch('read-all')
  async markAllRead(@CurrentUser() user: { id: string }) {
    await this.svc.markAllRead(user.id);
    return { ok: true };
  }
}
