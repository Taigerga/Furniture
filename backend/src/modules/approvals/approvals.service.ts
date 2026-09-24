import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ActivityService } from '../../common/utils/activity.service.js';
import { UploadService } from '../upload/upload.service.js';
import { JwtUser } from '../../common/decorators/current-user.decorator.js';
import { ApprovalEntity } from './dto/review.dto.js';

@Injectable()
export class ApprovalsService {
  constructor(
    private prisma: PrismaService,
    private activity: ActivityService,
    private upload: UploadService,
  ) {}

  async queue() {
    const [products, articles, galleries, categories] = await Promise.all([
      this.prisma.product.findMany({
        where: { approvalStatus: 'PENDING' },
        orderBy: { submittedAt: 'asc' },
        select: {
          id: true, name: true, slug: true, submittedAt: true,
          category: { select: { name: true } },
          createdBy: { select: { name: true, email: true } },
          _count: { select: { images: true } },
        },
      }),
      this.prisma.article.findMany({
        where: { approvalStatus: 'PENDING' },
        orderBy: { submittedAt: 'asc' },
        select: {
          id: true, title: true, slug: true, excerpt: true, thumbnail: true, submittedAt: true,
          pendingTitle: true, pendingSlug: true, pendingExcerpt: true, pendingContent: true, pendingThumbnail: true,
          createdBy: { select: { name: true, email: true } },
        },
      }),
      this.prisma.gallery.findMany({
        where: { approvalStatus: 'PENDING' },
        orderBy: { submittedAt: 'asc' },
        select: {
          id: true, title: true, url: true, category: true, submittedAt: true,
          pendingTitle: true, pendingCategory: true,
          createdBy: { select: { name: true, email: true } },
        },
      }),
      this.prisma.category.findMany({
        where: { approvalStatus: 'PENDING' },
        orderBy: { submittedAt: 'asc' },
        select: {
          id: true, name: true, slug: true, description: true, submittedAt: true,
          pendingName: true, pendingSlug: true, pendingDescription: true,
          createdBy: { select: { name: true, email: true } },
          _count: { select: { products: true } },
        },
      }),
    ]);
    return { products, articles, galleries, categories, total: products.length + articles.length + galleries.length + categories.length };
  }

  async pendingCount() {
    const [products, articles, galleries, categories] = await Promise.all([
      this.prisma.product.count({ where: { approvalStatus: 'PENDING' } }),
      this.prisma.article.count({ where: { approvalStatus: 'PENDING' } }),
      this.prisma.gallery.count({ where: { approvalStatus: 'PENDING' } }),
      this.prisma.category.count({ where: { approvalStatus: 'PENDING' } }),
    ]);
    return { total: products + articles + galleries + categories, products, articles, galleries, categories };
  }

  private async getPending(entity: ApprovalEntity, id: string) {
    if (entity === 'product') {
      const row = await this.prisma.product.findUnique({
        where: { id },
        select: { id: true, name: true, approvalStatus: true, createdById: true, slug: true },
      });
      if (!row || row.approvalStatus !== 'PENDING') throw new BadRequestException('Data tidak dalam antrean review.');
      return { ...row, label: row.name };
    }
    if (entity === 'article') {
      const row = await this.prisma.article.findUnique({
        where: { id },
        select: { id: true, title: true, approvalStatus: true, createdById: true },
      });
      if (!row || row.approvalStatus !== 'PENDING') throw new BadRequestException('Data tidak dalam antrean review.');
      return { ...row, label: row.title };
    }
    if (entity === 'category') {
      const row = await this.prisma.category.findUnique({
        where: { id },
        select: { id: true, name: true, approvalStatus: true, createdById: true },
      });
      if (!row || row.approvalStatus !== 'PENDING') throw new BadRequestException('Data tidak dalam antrean review.');
      return { ...row, label: row.name };
    }
    const row = await this.prisma.gallery.findUnique({
      where: { id },
      select: { id: true, title: true, approvalStatus: true, createdById: true },
    });
    if (!row || row.approvalStatus !== 'PENDING') throw new BadRequestException('Data tidak dalam antrean review.');
    return { ...row, label: row.title };
  }

  private setStatus(entity: ApprovalEntity, id: string, data: { approvalStatus: 'APPROVED' | 'REJECTED'; reviewedById: string; reviewedAt: Date; rejectionReason: string | null }) {
    if (entity === 'product') return this.prisma.product.update({ where: { id }, data });
    if (entity === 'article') return this.prisma.article.update({ where: { id }, data });
    if (entity === 'category') return this.prisma.category.update({ where: { id }, data });
    return this.prisma.gallery.update({ where: { id }, data });
  }

  /** Terapkan revisi bayangan ke kolom live. Pindahan 1:1 dari approvals.ts */
  private async applyPendingRevision(entity: Exclude<ApprovalEntity, 'product'>, id: string) {
    let skippedSlug = false;
    let oldThumbnail: string | null = null;
    if (entity === 'category') {
      const row = await this.prisma.category.findUnique({
        where: { id },
        select: { slug: true, pendingName: true, pendingSlug: true, pendingDescription: true },
      });
      if (!row) throw new NotFoundException('Data tidak ditemukan.');
      let slug = row.slug;
      if (row.pendingSlug && row.pendingSlug !== row.slug) {
        const taken = await this.prisma.category.findFirst({ where: { slug: row.pendingSlug, id: { not: id } }, select: { id: true } });
        if (taken) skippedSlug = true;
        else slug = row.pendingSlug;
      }
      await this.prisma.category.update({
        where: { id },
        data: {
          name: row.pendingName ?? undefined,
          slug,
          description: row.pendingName != null ? row.pendingDescription : undefined,
          pendingName: null, pendingSlug: null, pendingDescription: null,
        },
      });
    } else if (entity === 'article') {
      const row = await this.prisma.article.findUnique({
        where: { id },
        select: { slug: true, thumbnail: true, pendingTitle: true, pendingSlug: true, pendingExcerpt: true, pendingContent: true, pendingThumbnail: true },
      });
      if (!row) throw new NotFoundException('Data tidak ditemukan.');
      let slug = row.slug;
      if (row.pendingSlug && row.pendingSlug !== row.slug) {
        const taken = await this.prisma.article.findFirst({ where: { slug: row.pendingSlug, id: { not: id } }, select: { id: true } });
        if (taken) skippedSlug = true;
        else slug = row.pendingSlug;
      }
      oldThumbnail = row.thumbnail;
      await this.prisma.article.update({
        where: { id },
        data: {
          title: row.pendingTitle ?? undefined,
          slug,
          excerpt: row.pendingTitle != null ? row.pendingExcerpt : undefined,
          content: row.pendingContent ?? undefined,
          thumbnail: row.pendingThumbnail ?? undefined,
          pendingTitle: null, pendingSlug: null, pendingExcerpt: null, pendingContent: null, pendingThumbnail: null,
        },
      });
    } else {
      const row = await this.prisma.gallery.findUnique({
        where: { id },
        select: { pendingTitle: true, pendingCategory: true },
      });
      if (!row) throw new NotFoundException('Data tidak ditemukan.');
      await this.prisma.gallery.update({
        where: { id },
        data: {
          title: row.pendingTitle ?? undefined,
          category: row.pendingCategory ?? undefined,
          pendingTitle: null, pendingCategory: null,
        },
      });
    }
    return { skippedSlug, oldThumbnail };
  }

  private async clearPendingRevision(entity: Exclude<ApprovalEntity, 'product'>, id: string) {
    if (entity === 'category') {
      await this.prisma.category.update({ where: { id }, data: { pendingName: null, pendingSlug: null, pendingDescription: null } });
    } else if (entity === 'article') {
      const row = await this.prisma.article.findUnique({ where: { id }, select: { pendingThumbnail: true } });
      await this.prisma.article.update({
        where: { id },
        data: { pendingTitle: null, pendingSlug: null, pendingExcerpt: null, pendingContent: null, pendingThumbnail: null },
      });
      if (row?.pendingThumbnail) await this.upload.remove(row.pendingThumbnail).catch(() => undefined);
    } else {
      await this.prisma.gallery.update({ where: { id }, data: { pendingTitle: null, pendingCategory: null } });
    }
  }

  async approve(entity: ApprovalEntity, id: string, user: JwtUser) {
    const row = await this.getPending(entity, id);
    let note = '';
    if (entity !== 'product') {
      const applied = await this.applyPendingRevision(entity, id);
      if (applied.oldThumbnail) await this.upload.remove(applied.oldThumbnail).catch(() => undefined);
      if (applied.skippedSlug) note = ' Slug baru dipakai pihak lain sehingga slug lama dipertahankan.';
    }
    await this.setStatus(entity, id, { approvalStatus: 'APPROVED', reviewedById: user.sub, reviewedAt: new Date(), rejectionReason: null });
    await this.activity.logActivity({ actorId: user.sub, action: 'APPROVE', entityType: entity, entityId: id, fromStatus: 'PENDING', toStatus: 'APPROVED', note: note || undefined });
    await this.activity.notifyUser({
      userId: row.createdById, type: 'APPROVED', title: 'Pengajuan disetujui',
      message: `Pengajuan Anda "${row.label}" telah disetujui dan tayang.${note}`,
    });
    return { entity, id, note: note || undefined };
  }

  async reject(entity: ApprovalEntity, id: string, reason: string, user: JwtUser) {
    if (!reason || reason.trim().length < 5) throw new BadRequestException('Alasan penolakan minimal 5 karakter.');
    const row = await this.getPending(entity, id);
    if (entity !== 'product') await this.clearPendingRevision(entity, id);
    await this.setStatus(entity, id, { approvalStatus: 'REJECTED', reviewedById: user.sub, reviewedAt: new Date(), rejectionReason: reason });
    await this.activity.logActivity({
      actorId: user.sub, action: 'REJECT', entityType: entity, entityId: id,
      fromStatus: 'PENDING', toStatus: 'REJECTED', note: reason,
    });
    await this.activity.notifyUser({
      userId: row.createdById, type: 'REJECTED', title: 'Pengajuan ditolak',
      message: `Pengajuan Anda "${row.label}" ditolak. Alasan: ${reason}`,
      link: '/worker/submissions',
    });
    return { entity, id };
  }
}
