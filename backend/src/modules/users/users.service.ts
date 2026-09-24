import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ActivityService } from '../../common/utils/activity.service.js';
import { JwtUser } from '../../common/decorators/current-user.decorator.js';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private activity: ActivityService,
  ) {}

  async listWorkers() {
    const workers = await this.prisma.user.findMany({
      where: { role: 'WORKER' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, isActive: true, createdAt: true,
        _count: { select: { productsCreated: true, articlesCreated: true, galleriesCreated: true } },
      },
    });
    return Promise.all(
      workers.map(async (w) => ({
        ...w,
        pending:
          (await this.prisma.product.count({ where: { createdById: w.id, approvalStatus: 'PENDING' } })) +
          (await this.prisma.article.count({ where: { createdById: w.id, approvalStatus: 'PENDING' } })) +
          (await this.prisma.gallery.count({ where: { createdById: w.id, approvalStatus: 'PENDING' } })),
      })),
    );
  }

  async createWorker(name: string, emailRaw: string, password: string) {
    const email = emailRaw.toLowerCase();
    if (await this.prisma.user.findUnique({ where: { email }, select: { id: true } })) {
      throw new BadRequestException('Email sudah dipakai akun lain.');
    }
    const worker = await this.prisma.user.create({
      data: { name, email, passwordHash: await bcrypt.hash(password, 10), role: 'WORKER', isActive: true },
    });
    await this.activity.logActivity({ action: 'CREATE_WORKER', entityType: 'user', entityId: worker.id, note: email });
    return { id: worker.id, email: worker.email };
  }

  async toggleActive(id: string, isActive: boolean, actor: JwtUser) {
    if (id === actor.sub) throw new ForbiddenException('Tidak dapat menonaktifkan akun sendiri.');
    await this.prisma.user.update({ where: { id }, data: { isActive } }).catch(() => {
      throw new NotFoundException('Akun tidak ditemukan.');
    });
    await this.activity.logActivity({
      actorId: actor.sub,
      action: isActive ? 'ACTIVATE_WORKER' : 'DEACTIVATE_WORKER',
      entityType: 'user',
      entityId: id,
    });
    return { id, isActive };
  }

  async resetPassword(id: string, password: string, actor: JwtUser) {
    await this.prisma.user.update({
      where: { id },
      data: { passwordHash: await bcrypt.hash(password, 10) },
    }).catch(() => {
      throw new NotFoundException('Akun tidak ditemukan.');
    });
    await this.activity.logActivity({ actorId: actor.sub, action: 'RESET_PASSWORD', entityType: 'user', entityId: id });
    return { id };
  }

  async updateAccount(user: JwtUser, name: string, emailRaw: string) {
    const email = emailRaw.toLowerCase();
    const taken = await this.prisma.user.findFirst({ where: { email, id: { not: user.sub } }, select: { id: true } });
    if (taken) throw new BadRequestException('Email sudah dipakai akun lain.');
    const current = await this.prisma.user.findUnique({ where: { id: user.sub }, select: { email: true } });
    await this.prisma.user.update({ where: { id: user.sub }, data: { name, email } });
    return { emailChanged: (current?.email.toLowerCase() ?? '') !== email };
  }

  async changePassword(user: JwtUser, currentPassword: string, newPassword: string, confirmPassword: string) {
    if (newPassword !== confirmPassword) throw new BadRequestException('Konfirmasi password tidak sama.');
    if (newPassword === currentPassword) throw new BadRequestException('Password baru harus berbeda dari yang lama.');
    const row = await this.prisma.user.findUnique({ where: { id: user.sub }, select: { passwordHash: true } });
    if (!row) throw new NotFoundException('Akun tidak ditemukan.');
    const valid = await bcrypt.compare(currentPassword, row.passwordHash);
    if (!valid) throw new BadRequestException('Password saat ini salah.');
    await this.prisma.user.update({
      where: { id: user.sub },
      data: { passwordHash: await bcrypt.hash(newPassword, 10) },
    });
    return { ok: true };
  }
}
