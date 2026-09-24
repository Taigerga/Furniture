import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ActivityService } from '../../common/utils/activity.service.js';
import { UploadService } from '../upload/upload.service.js';
import { JwtUser } from '../../common/decorators/current-user.decorator.js';
import { assertAdminCanModify, assertOwnerOrAdmin } from '../../common/guards/roles.guard.js';
import { GalleryDto } from './dto/gallery.dto.js';

const ADMIN_PAGE_SIZE = 10;

@Injectable()
export class GalleryService {
  constructor(
    private prisma: PrismaService,
    private activity: ActivityService,
    private upload: UploadService,
  ) {}

  async listPublic() {
    return this.prisma.gallery.findMany({
      where: { approvalStatus: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, url: true, category: true },
    });
  }

  async adminList(category?: string, page = 1) {
    const where = category ? { category } : {};
    const [total, items] = await Promise.all([
      this.prisma.gallery.count({ where }),
      this.prisma.gallery.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * ADMIN_PAGE_SIZE,
        take: ADMIN_PAGE_SIZE,
        select: {
          id: true, title: true, url: true, category: true, createdAt: true,
          approvalStatus: true, pendingTitle: true, createdById: true,
          createdBy: { select: { name: true, email: true, isActive: true } },
        },
      }),
    ]);
    return { items, total, totalPages: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)) };
  }

  async adminCreate(dto: GalleryDto, user: JwtUser) {
    if (!dto.url) throw new BadRequestException('Pilih satu gambar.');
    return this.prisma.gallery.create({
      data: { title: dto.title, category: dto.category, url: dto.url, createdById: user.sub, approvalStatus: 'APPROVED' },
    });
  }

  async adminUpdate(id: string, dto: GalleryDto, user: JwtUser) {
    const current = await this.prisma.gallery.findUnique({ where: { id }, select: { createdById: true, approvalStatus: true } });
    if (!current) throw new NotFoundException('Foto tidak ditemukan.');
    await assertAdminCanModify({ ...current, adminId: user.sub, kind: 'edit' }, async (cid) =>
      this.prisma.user.findUnique({ where: { id: cid }, select: { isActive: true } }),
    );
    return this.prisma.gallery.update({ where: { id }, data: { title: dto.title, category: dto.category } });
  }

  async adminDelete(id: string, user: JwtUser) {
    const item = await this.prisma.gallery.findUnique({ where: { id }, select: { url: true, createdById: true, approvalStatus: true } });
    if (!item) throw new NotFoundException('Foto tidak ditemukan.');
    await assertAdminCanModify({ createdById: item.createdById, approvalStatus: item.approvalStatus, adminId: user.sub, kind: 'delete' }, async (cid) =>
      this.prisma.user.findUnique({ where: { id: cid }, select: { isActive: true } }),
    );
    await this.prisma.gallery.delete({ where: { id } });
    await this.upload.remove(item.url);
    return { id };
  }

  private async owned(id: string, user: JwtUser) {
    const g = await this.prisma.gallery.findUnique({
      where: { id },
      select: { id: true, title: true, approvalStatus: true, createdById: true },
    });
    if (!g) throw new NotFoundException('Galeri tidak ditemukan.');
    assertOwnerOrAdmin(g.createdById, user);
    return g;
  }

  async workerGet(id: string, user: JwtUser) {
    const g = await this.prisma.gallery.findUnique({ where: { id } });
    if (!g) throw new NotFoundException('Galeri tidak ditemukan.');
    if (user.role !== 'ADMIN' && g.createdById !== user.sub) {
      throw new ForbiddenException('Anda hanya dapat mengelola data milik sendiri.');
    }
    return g;
  }

  async workerList(user: JwtUser, page = 1) {    const where = user.role === 'ADMIN' ? {} : { createdById: user.sub };
    const [total, items] = await Promise.all([
      this.prisma.gallery.count({ where }),
      this.prisma.gallery.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * ADMIN_PAGE_SIZE,
        take: ADMIN_PAGE_SIZE,
        select: {
          id: true, title: true, url: true, category: true, createdAt: true,
          approvalStatus: true, rejectionReason: true, pendingTitle: true, pendingCategory: true,
        },
      }),
    ]);
    return { items, total, totalPages: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)) };
  }

  async workerCreate(dto: GalleryDto, user: JwtUser) {
    if (!dto.url) throw new BadRequestException('Pilih satu gambar.');
    const item = await this.prisma.gallery.create({
      data: { title: dto.title, category: dto.category, url: dto.url, createdById: user.sub, approvalStatus: 'DRAFT' },
    });
    await this.activity.logActivity({ actorId: user.sub, action: 'CREATE', entityType: 'gallery', entityId: item.id, toStatus: 'DRAFT' });
    return item;
  }

  async workerUpdate(id: string, dto: GalleryDto, user: JwtUser) {
    const current = await this.owned(id, user);
    if (current.approvalStatus === 'PENDING') throw new ForbiddenException('Data yang sedang direview tidak dapat diubah.');
    const backToPending = current.approvalStatus === 'APPROVED';
    await this.prisma.gallery.update({
      where: { id },
      data: backToPending
        ? { pendingTitle: dto.title, pendingCategory: dto.category, approvalStatus: 'PENDING', submittedAt: new Date(), rejectionReason: null }
        : { title: dto.title, category: dto.category },
    });
    await this.activity.logActivity({ actorId: user.sub, action: 'UPDATE', entityType: 'gallery', entityId: id, fromStatus: current.approvalStatus, toStatus: backToPending ? 'PENDING' : undefined });
    if (backToPending) {
      await this.activity.notifyAdmins({
        type: 'SUBMITTED', title: `Revisi galeri: ${dto.title}`,
        message: `${user.name ?? user.email} mengajukan revisi galeri, versi lama tetap tayang.`,
        link: '/admin/approvals?tab=gallery',
      });
    }
    return this.prisma.gallery.findUnique({ where: { id } });
  }

  async workerDelete(id: string, user: JwtUser) {
    const current = await this.owned(id, user);
    if (current.approvalStatus !== 'DRAFT' && current.approvalStatus !== 'REJECTED') {
      throw new ForbiddenException('Hanya draf atau yang ditolak yang dapat dihapus.');
    }
    const item = await this.prisma.gallery.findUnique({ where: { id }, select: { url: true } });
    await this.prisma.gallery.delete({ where: { id } });
    if (item) await this.upload.remove(item.url);
    await this.activity.logActivity({ actorId: user.sub, action: 'DELETE', entityType: 'gallery', entityId: id, fromStatus: current.approvalStatus });
    return { id };
  }

  async workerSubmit(id: string, user: JwtUser) {
    const current = await this.owned(id, user);
    if (current.approvalStatus !== 'DRAFT' && current.approvalStatus !== 'REJECTED') {
      throw new ForbiddenException('Hanya draf yang dapat diajukan.');
    }
    await this.prisma.gallery.update({ where: { id }, data: { approvalStatus: 'PENDING', submittedAt: new Date(), rejectionReason: null } });
    await this.activity.logActivity({ actorId: user.sub, action: 'SUBMIT', entityType: 'gallery', entityId: id, fromStatus: current.approvalStatus, toStatus: 'PENDING' });
    await this.activity.notifyAdmins({
      type: 'SUBMITTED', title: `Pengajuan galeri: ${current.title}`,
      message: `${user.name ?? user.email} mengajukan foto untuk direview.`,
      link: '/admin/approvals',
    });
    return this.prisma.gallery.findUnique({ where: { id } });
  }
}
