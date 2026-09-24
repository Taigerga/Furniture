import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

export type ActivityEntity = 'product' | 'article' | 'gallery' | 'category' | 'inquiry' | 'user';

/** Pindahan 1:1 dari my-app/lib/actions/workflow.ts */
@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  async logActivity(input: {
    actorId?: string;
    action: string;
    entityType: ActivityEntity;
    entityId: string;
    fromStatus?: string;
    toStatus?: string;
    note?: string;
  }) {
    await this.prisma.activityLog.create({ data: input }).catch(() => undefined);
  }

  async notifyUser(input: {
    userId: string;
    type: string;
    title: string;
    message: string;
    link?: string;
  }) {
    await this.prisma.notification.create({ data: input }).catch(() => undefined);
  }

  async notifyAdmins(input: { type: string; title: string; message: string; link?: string }) {
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN', isActive: true },
      select: { id: true },
    });
    if (admins.length === 0) return;
    await this.prisma.notification
      .createMany({ data: admins.map((a) => ({ userId: a.id, ...input })) })
      .catch(() => undefined);
  }
}
