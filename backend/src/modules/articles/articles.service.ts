import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ActivityService } from '../../common/utils/activity.service.js';
import { UploadService } from '../upload/upload.service.js';
import { JwtUser } from '../../common/decorators/current-user.decorator.js';
import { assertAdminCanModify, assertOwnerOrAdmin } from '../../common/guards/roles.guard.js';
import { cleanContent } from '../../common/utils/sanitize.util.js';
import { ArticleDto } from './dto/article.dto.js';

const ADMIN_PAGE_SIZE = 10;

@Injectable()
export class ArticlesService {
  constructor(
    private prisma: PrismaService,
    private activity: ActivityService,
    private upload: UploadService,
  ) {}

  async listPublished() {
    return this.prisma.article.findMany({
      where: { status: 'PUBLISHED', approvalStatus: 'APPROVED' },
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true, title: true, slug: true, excerpt: true, thumbnail: true, publishedAt: true,
        author: { select: { name: true } },
      },
    });
  }

  async getBySlug(slug: string) {
    const a = await this.prisma.article.findFirst({
      where: { slug, status: 'PUBLISHED', approvalStatus: 'APPROVED' },
      select: {
        id: true, title: true, slug: true, excerpt: true, content: true,
        thumbnail: true, publishedAt: true, author: { select: { name: true } },
      },
    });
    if (!a) throw new NotFoundException('Artikel tidak ditemukan.');
    return a;
  }

  async adminList(status?: string, page = 1) {
    const where = status ? { status: status as 'DRAFT' | 'PUBLISHED' } : {};
    const [total, items] = await Promise.all([
      this.prisma.article.count({ where }),
      this.prisma.article.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * ADMIN_PAGE_SIZE,
        take: ADMIN_PAGE_SIZE,
        select: {
          id: true, title: true, slug: true, status: true, publishedAt: true, updatedAt: true,
          approvalStatus: true, pendingTitle: true, createdById: true,
          author: { select: { name: true } },
          createdBy: { select: { name: true, email: true, isActive: true } },
        },
      }),
    ]);
    return { items, total, totalPages: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)) };
  }

  async adminGet(id: string) {
    const a = await this.prisma.article.findUnique({
      where: { id },
      include: { createdBy: { select: { name: true, email: true, isActive: true } } },
    });
    if (!a) throw new NotFoundException('Artikel tidak ditemukan.');
    return a;
  }

  private async ensureSlugFree(slug: string, excludeId?: string) {
    const taken = await this.prisma.article.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    });
    if (taken) throw new BadRequestException('Slug sudah dipakai artikel lain.');
  }

  async adminCreate(dto: ArticleDto, user: JwtUser) {
    await this.ensureSlugFree(dto.slug);
    return this.prisma.article.create({
      data: {
        title: dto.title, slug: dto.slug, excerpt: dto.excerpt || null,
        content: cleanContent(dto.content), thumbnail: dto.thumbnail || null,
        status: dto.status ?? 'DRAFT',
        publishedAt: dto.status === 'PUBLISHED' ? new Date() : null,
        authorId: user.sub, createdById: user.sub, approvalStatus: 'APPROVED',
      },
    });
  }

  async adminUpdate(id: string, dto: ArticleDto, user: JwtUser) {
    await this.ensureSlugFree(dto.slug, id);
    const current = await this.prisma.article.findUnique({
      where: { id }, select: { thumbnail: true, status: true, createdById: true, approvalStatus: true },
    });
    if (!current) throw new NotFoundException('Artikel tidak ditemukan.');
    await assertAdminCanModify({ createdById: current.createdById, approvalStatus: current.approvalStatus, adminId: user.sub, kind: 'edit' }, async (cid) =>
      this.prisma.user.findUnique({ where: { id: cid }, select: { isActive: true } }),
    );
    let thumbnail = current.thumbnail;
    if (dto.thumbnail && dto.thumbnail !== current.thumbnail) {
      if (thumbnail) await this.upload.remove(thumbnail);
      thumbnail = dto.thumbnail;
    }
    return this.prisma.article.update({
      where: { id },
      data: {
        title: dto.title, slug: dto.slug, excerpt: dto.excerpt || null,
        content: cleanContent(dto.content), thumbnail,
        status: dto.status ?? 'DRAFT',
        publishedAt: dto.status === 'PUBLISHED' && current.status !== 'PUBLISHED' ? new Date() : undefined,
      },
    });
  }

  async adminDelete(id: string, user: JwtUser) {
    const article = await this.prisma.article.findUnique({
      where: { id }, select: { thumbnail: true, createdById: true, approvalStatus: true },
    });
    if (!article) throw new NotFoundException('Artikel tidak ditemukan.');
    await assertAdminCanModify(
      { createdById: article.createdById, approvalStatus: article.approvalStatus, adminId: user.sub, kind: 'delete' },
      async (cid) => this.prisma.user.findUnique({ where: { id: cid }, select: { isActive: true } }),
    );
    if (article.thumbnail) await this.upload.remove(article.thumbnail).catch(() => undefined);
    await this.prisma.article.delete({ where: { id } });
    return { id };
  }

  private async owned(id: string, user: JwtUser) {
    const a = await this.prisma.article.findUnique({
      where: { id },
      select: { id: true, slug: true, title: true, approvalStatus: true, createdById: true },
    });
    if (!a) throw new NotFoundException('Artikel tidak ditemukan.');
    assertOwnerOrAdmin(a.createdById, user);
    return a;
  }

  async workerList(user: JwtUser, page = 1) {
    const where = user.role === 'ADMIN' ? {} : { createdById: user.sub };
    const [total, items] = await Promise.all([
      this.prisma.article.count({ where }),
      this.prisma.article.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * ADMIN_PAGE_SIZE,
        take: ADMIN_PAGE_SIZE,
        select: {
          id: true, title: true, slug: true, status: true, approvalStatus: true,
          rejectionReason: true, updatedAt: true, pendingTitle: true, pendingSlug: true,
        },
      }),
    ]);
    return { items, total, totalPages: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)) };
  }

  async workerGet(id: string, user: JwtUser) {
    const a = await this.prisma.article.findUnique({ where: { id } });
    if (!a) throw new NotFoundException('Artikel tidak ditemukan.');
    if (user.role !== 'ADMIN' && a.createdById !== user.sub) {
      throw new ForbiddenException('Anda hanya dapat mengelola data milik sendiri.');
    }
    return a;
  }

  async workerCreate(dto: ArticleDto, user: JwtUser) {
    await this.ensureSlugFree(dto.slug);
    const article = await this.prisma.article.create({
      data: {
        title: dto.title, slug: dto.slug, excerpt: dto.excerpt || null,
        content: cleanContent(dto.content), thumbnail: dto.thumbnail || null,
        status: dto.status ?? 'DRAFT', publishedAt: null,
        authorId: user.sub, createdById: user.sub, approvalStatus: 'DRAFT',
      },
    });
    await this.activity.logActivity({ actorId: user.sub, action: 'CREATE', entityType: 'article', entityId: article.id, toStatus: 'DRAFT' });
    return article;
  }

  async workerUpdate(id: string, dto: ArticleDto, user: JwtUser) {
    const current = await this.owned(id, user);
    if (current.approvalStatus === 'PENDING') throw new ForbiddenException('Data yang sedang direview tidak dapat diubah.');
    await this.ensureSlugFree(dto.slug, id);
    const existing = await this.prisma.article.findUnique({ where: { id }, select: { thumbnail: true } });
    if (current.approvalStatus === 'APPROVED') {
      await this.prisma.article.update({
        where: { id },
        data: {
          pendingTitle: dto.title, pendingSlug: dto.slug, pendingExcerpt: dto.excerpt || null,
          pendingContent: cleanContent(dto.content),
          ...(dto.thumbnail ? { pendingThumbnail: dto.thumbnail } : {}),
          approvalStatus: 'PENDING', submittedAt: new Date(), rejectionReason: null,
        },
      });
      await this.activity.logActivity({ actorId: user.sub, action: 'UPDATE', entityType: 'article', entityId: id, fromStatus: 'APPROVED', toStatus: 'PENDING' });
      await this.activity.notifyAdmins({
        type: 'SUBMITTED', title: `Revisi artikel: ${dto.title}`,
        message: `${user.name ?? user.email} mengajukan revisi artikel, versi lama tetap tayang.`,
        link: '/admin/approvals?tab=articles',
      });
      return this.prisma.article.findUnique({ where: { id } });
    }
    let thumbnail = existing?.thumbnail ?? null;
    if (dto.thumbnail && dto.thumbnail !== thumbnail) {
      if (thumbnail) await this.upload.remove(thumbnail);
      thumbnail = dto.thumbnail;
    }
    await this.prisma.article.update({
      where: { id },
      data: {
        title: dto.title, slug: dto.slug, excerpt: dto.excerpt || null,
        content: cleanContent(dto.content), thumbnail, status: dto.status ?? 'DRAFT',
      },
    });
    await this.activity.logActivity({ actorId: user.sub, action: 'UPDATE', entityType: 'article', entityId: id, fromStatus: current.approvalStatus });
    return this.prisma.article.findUnique({ where: { id } });
  }

  async workerDelete(id: string, user: JwtUser) {
    const current = await this.owned(id, user);
    if (current.approvalStatus !== 'DRAFT' && current.approvalStatus !== 'REJECTED') {
      throw new ForbiddenException('Hanya draf atau yang ditolak yang dapat dihapus.');
    }
    const article = await this.prisma.article.findUnique({ where: { id }, select: { thumbnail: true, pendingThumbnail: true } });
    if (article?.thumbnail) await this.upload.remove(article.thumbnail).catch(() => undefined);
    if (article?.pendingThumbnail) await this.upload.remove(article.pendingThumbnail).catch(() => undefined);
    await this.prisma.article.delete({ where: { id } });
    await this.activity.logActivity({ actorId: user.sub, action: 'DELETE', entityType: 'article', entityId: id, fromStatus: current.approvalStatus });
    return { id };
  }

  async workerSubmit(id: string, user: JwtUser) {
    const current = await this.owned(id, user);
    if (current.approvalStatus !== 'DRAFT' && current.approvalStatus !== 'REJECTED') {
      throw new ForbiddenException('Hanya draf yang dapat diajukan.');
    }
    await this.prisma.article.update({
      where: { id }, data: { approvalStatus: 'PENDING', submittedAt: new Date(), rejectionReason: null },
    });
    await this.activity.logActivity({ actorId: user.sub, action: 'SUBMIT', entityType: 'article', entityId: id, fromStatus: current.approvalStatus, toStatus: 'PENDING' });
    await this.activity.notifyAdmins({
      type: 'SUBMITTED', title: `Pengajuan artikel: ${current.title}`,
      message: `${user.name ?? user.email} mengajukan artikel untuk direview.`,
      link: '/admin/approvals',
    });
    return this.prisma.article.findUnique({ where: { id } });
  }
}
