import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ActivityService } from '../../common/utils/activity.service.js';
import { JwtUser } from '../../common/decorators/current-user.decorator.js';
import { assertAdminCanModify, assertOwnerOrAdmin } from '../../common/guards/roles.guard.js';
import { CategoryDto } from './dto/category.dto.js';

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    private activity: ActivityService,
  ) {}

  async listPublic() {
    return this.prisma.category.findMany({
      where: { approvalStatus: 'APPROVED' },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true, _count: { select: { products: true } } },
    });
  }

  async adminList() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true, name: true, slug: true, description: true, approvalStatus: true,
        pendingName: true, createdById: true,
        createdBy: { select: { name: true, email: true, isActive: true } },
        _count: { select: { products: true } },
      },
    });
  }

  private async ensureSlugFree(slug: string, excludeId?: string) {
    const taken = await this.prisma.category.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    });
    if (taken) throw new BadRequestException('Slug sudah dipakai kategori lain.');
  }

  async adminCreate(dto: CategoryDto, user: JwtUser) {
    await this.ensureSlugFree(dto.slug);
    return this.prisma.category.create({
      data: {
        name: dto.name, slug: dto.slug, description: dto.description || null,
        createdById: user.sub, approvalStatus: 'APPROVED',
      },
    });
  }

  async adminUpdate(id: string, dto: CategoryDto, user: JwtUser) {
    const current = await this.prisma.category.findUnique({ where: { id }, select: { createdById: true, approvalStatus: true } });
    if (!current) throw new NotFoundException('Kategori tidak ditemukan.');
    await assertAdminCanModify({ ...current, adminId: user.sub, kind: 'edit' }, async (cid) =>
      this.prisma.user.findUnique({ where: { id: cid }, select: { isActive: true } }),
    );
    await this.ensureSlugFree(dto.slug, id);
    return this.prisma.category.update({
      where: { id },
      data: { name: dto.name, slug: dto.slug, description: dto.description || null },
    });
  }

  async adminDelete(id: string, user: JwtUser) {
    const row = await this.prisma.category.findUnique({ where: { id }, select: { createdById: true, approvalStatus: true } });
    if (!row) throw new NotFoundException('Kategori tidak ditemukan.');
    await assertAdminCanModify({ ...row, adminId: user.sub, kind: 'delete' }, async (cid) =>
      this.prisma.user.findUnique({ where: { id: cid }, select: { isActive: true } }),
    );
    const used = await this.prisma.product.count({ where: { categoryId: id } });
    if (used > 0) throw new BadRequestException(`Kategori masih dipakai ${used} produk, tidak bisa dihapus.`);
    await this.prisma.category.delete({ where: { id } });
    return { id };
  }

  private async owned(id: string, user: JwtUser) {
    const c = await this.prisma.category.findUnique({
      where: { id },
      select: { id: true, name: true, approvalStatus: true, createdById: true, _count: { select: { products: true } } },
    });
    if (!c) throw new NotFoundException('Kategori tidak ditemukan.');
    assertOwnerOrAdmin(c.createdById, user);
    return c;
  }

  async workerList(user: JwtUser) {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true, name: true, slug: true, description: true, createdById: true,
        approvalStatus: true, rejectionReason: true, pendingName: true, pendingSlug: true,
        _count: { select: { products: true } },
      },
    });
  }

  async workerCreate(dto: CategoryDto, user: JwtUser) {
    await this.ensureSlugFree(dto.slug);
    const cat = await this.prisma.category.create({
      data: {
        name: dto.name, slug: dto.slug, description: dto.description || null,
        createdById: user.sub, approvalStatus: 'DRAFT',
      },
    });
    await this.activity.logActivity({ actorId: user.sub, action: 'CREATE', entityType: 'category', entityId: cat.id, toStatus: 'DRAFT' });
    return cat;
  }

  async workerUpdate(id: string, dto: CategoryDto, user: JwtUser) {
    const current = await this.owned(id, user);
    if (current.approvalStatus === 'PENDING') throw new ForbiddenException('Data yang sedang direview tidak dapat diubah.');
    await this.ensureSlugFree(dto.slug, id);
    const backToPending = current.approvalStatus === 'APPROVED';
    await this.prisma.category.update({
      where: { id },
      data: backToPending
        ? {
            pendingName: dto.name, pendingSlug: dto.slug, pendingDescription: dto.description || null,
            approvalStatus: 'PENDING', submittedAt: new Date(), rejectionReason: null,
          }
        : { name: dto.name, slug: dto.slug, description: dto.description || null },
    });
    await this.activity.logActivity({
      actorId: user.sub, action: 'UPDATE', entityType: 'category', entityId: id,
      fromStatus: current.approvalStatus, toStatus: backToPending ? 'PENDING' : undefined,
    });
    if (backToPending) {
      await this.activity.notifyAdmins({
        type: 'SUBMITTED', title: `Revisi kategori: ${dto.name}`,
        message: `${user.name ?? user.email} mengubah kategori tayang, menunggu review ulang.`,
        link: '/admin/approvals?tab=categories',
      });
    }
    return this.prisma.category.findUnique({ where: { id } });
  }

  async workerDelete(id: string, user: JwtUser) {
    const current = await this.owned(id, user);
    if (current.approvalStatus !== 'DRAFT' && current.approvalStatus !== 'REJECTED') {
      throw new ForbiddenException('Hanya draf atau yang ditolak yang dapat dihapus.');
    }
    if (current._count.products > 0) throw new BadRequestException('Kategori masih dipakai produk, tidak bisa dihapus.');
    await this.prisma.category.delete({ where: { id } });
    await this.activity.logActivity({ actorId: user.sub, action: 'DELETE', entityType: 'category', entityId: id, fromStatus: current.approvalStatus });
    return { id };
  }

  async workerSubmit(id: string, user: JwtUser) {
    const current = await this.owned(id, user);
    if (current.approvalStatus !== 'DRAFT' && current.approvalStatus !== 'REJECTED') {
      throw new ForbiddenException('Hanya draf yang dapat diajukan.');
    }
    await this.prisma.category.update({
      where: { id }, data: { approvalStatus: 'PENDING', submittedAt: new Date(), rejectionReason: null },
    });
    await this.activity.logActivity({ actorId: user.sub, action: 'SUBMIT', entityType: 'category', entityId: id, fromStatus: current.approvalStatus, toStatus: 'PENDING' });
    await this.activity.notifyAdmins({
      type: 'SUBMITTED', title: `Pengajuan kategori: ${current.name}`,
      message: `${user.name ?? user.email} mengajukan kategori untuk direview.`,
      link: '/admin/approvals?tab=categories',
    });
    return this.prisma.category.findUnique({ where: { id } });
  }
}
