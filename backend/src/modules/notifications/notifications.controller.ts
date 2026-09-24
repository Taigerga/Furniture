import { Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { JwtUser } from '../../common/decorators/current-user.decorator.js';
import { NotificationsService } from './notifications.service.js';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'WORKER')
export class NotificationsController {
  constructor(private notifications: NotificationsService) {}

  @Get()
  list(@CurrentUser() u: JwtUser, @Query('page') page?: string, @Query('unread') unread?: string) {
    return this.notifications.list(u.sub, Number(page) || 1, unread === 'true' || unread === '1');
  }

  @Get('unread-count')
  unreadCount(@CurrentUser() u: JwtUser) {
    return this.notifications.unreadCount(u.sub);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string, @CurrentUser() u: JwtUser) {
    return this.notifications.markRead(id, u.sub);
  }

  @Post('read-all')
  markAll(@CurrentUser() u: JwtUser) {
    return this.notifications.markAllRead(u.sub);
  }
}
