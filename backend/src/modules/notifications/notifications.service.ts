import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

export const NOTIF_PAGE_SIZE = 15;

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async list(userId: string, page = 1, onlyUnread = false) {
    const where = { userId, ...(onlyUnread ? { isRead: false } : {}) };
    const [total, items, unread] = await Promise.all([
      this.prisma.notification.count({ where }),
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * NOTIF_PAGE_SIZE,
        take: NOTIF_PAGE_SIZE,
      }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);
    return { items, total, unread, totalPages: Math.max(1, Math.ceil(total / NOTIF_PAGE_SIZE)) };
  }

  async unreadCount(userId: string) {
    return { unread: await this.prisma.notification.count({ where: { userId, isRead: false } }) };
  }

  async markRead(id: string, userId: string) {
    await this.prisma.notification.updateMany({ where: { id, userId }, data: { isRead: true } });
    return { id };
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
    return { ok: true };
  }
}
