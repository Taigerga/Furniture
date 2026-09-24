import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ActivityService } from '../../common/utils/activity.service.js';
import { UploadService } from '../upload/upload.service.js';
import { JwtUser } from '../../common/decorators/current-user.decorator.js';
import { assertAdminCanModify, assertOwnerOrAdmin } from '../../common/guards/roles.guard.js';
import { ProductDto } from './dto/product.dto.js';

export const PRODUCT_PAGE_SIZE = 12;
export const ADMIN_PAGE_SIZE = 10;

type ProductInput = Omit<ProductDto, 'imageUrls'>;

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private activity: ActivityService,
    private upload: UploadService,
  ) {}

  // ---------- PUBLIC ----------
  async listPublic(query?: string, categorySlug?: string, page = 1) {
    const where: Record<string, unknown> = { status: 'ACTIVE', approvalStatus: 'APPROVED' };
    if (categorySlug) (where as Record<string, unknown>).category = { slug: categorySlug };
    if (query) {
      (where as Record<string, unknown>).OR = [
        { name: { contains: query } },
        { shortDesc: { contains: query } },
        { material: { contains: query } },
      ];
    }
    const [total, items] = await Promise.all([
      this.prisma.product.count({ where: where as never }),
      this.prisma.product.findMany({
        where: where as never,
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * PRODUCT_PAGE_SIZE,
        take: PRODUCT_PAGE_SIZE,
        select: {
          id: true, name: true, slug: true, shortDesc: true, material: true,
          category: { select: { name: true, slug: true } },
          images: { where: { isMain: true }, take: 1, select: { url: true, alt: true } },
        },
      }),
    ]);
    return { items, total, totalPages: Math.max(1, Math.ceil(total / PRODUCT_PAGE_SIZE)) };
  }

  async getBySlug(slug: string) {
    const p = await this.prisma.product.findFirst({
      where: { slug, status: 'ACTIVE', approvalStatus: 'APPROVED' },
      select: {
        id: true, name: true, slug: true, shortDesc: true, description: true,
        material: true, dimensions: true, color: true, specifications: true,
        category: { select: { name: true, slug: true } },
        images: { orderBy: { sortOrder: 'asc' }, select: { url: true, alt: true } },
      },
    });
    if (!p) throw new NotFoundException('Produk tidak ditemukan.');
    return p;
  }

  async getRelated(categorySlug: string, excludeId: string, limit = 4) {
    return this.prisma.product.findMany({
      where: { status: 'ACTIVE', approvalStatus: 'APPROVED', category: { slug: categorySlug }, id: { not: excludeId } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true, name: true, slug: true, material: true,
        category: { select: { name: true } },
        images: { where: { isMain: true }, take: 1, select: { url: true, alt: true } },
      },
    });
  }

  async getFeatured(limit = 6) {
    return this.prisma.product.findMany({
      where: { status: 'ACTIVE', approvalStatus: 'APPROVED' },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      take: limit,
      select: {
        id: true, name: true, slug: true, shortDesc: true, material: true,
        category: { select: { name: true, slug: true } },
        images: { where: { isMain: true }, take: 1, select: { url: true, alt: true } },
      },
    });
  }

  async getAllActive() {
    return this.prisma.product.findMany({
      where: { status: 'ACTIVE', approvalStatus: 'APPROVED' },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    });
  }

  // ---------- ADMIN ----------
  async adminList(q?: string, status?: string, page = 1) {
    const where: Record<string, unknown> = {};
    if (status) (where as Record<string, unknown>).status = status;
    if (q) (where as Record<string, unknown>).OR = [{ name: { contains: q } }, { slug: { contains: q } }];
    const [total, items] = await Promise.all([
      this.prisma.product.count({ where: where as never }),
      this.prisma.product.findMany({
        where: where as never,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * ADMIN_PAGE_SIZE,
        take: ADMIN_PAGE_SIZE,
        select: {
          id: true, name: true, slug: true, status: true, featured: true, updatedAt: true,
          approvalStatus: true, createdById: true,
          category: { select: { name: true } },
          createdBy: { select: { name: true, email: true, isActive: true } },
          _count: { select: { images: true, inquiries: true } },
        },
      }),
    ]);
    return { items, total, totalPages: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)) };
  }

  async adminGet(id: string) {
    const p = await this.prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        category: true,
        createdBy: { select: { name: true, email: true, isActive: true } },
      },
    });
    if (!p) throw new NotFoundException('Produk tidak ditemukan.');
    return p;
  }

  private toData(d: ProductInput) {
    const opt = (v?: string) => (v === undefined || v === '' ? null : v);
    return {
      name: d.name,
      slug: d.slug,
      categoryId: d.categoryId,
      shortDesc: opt(d.shortDesc),
      description: opt(d.description),
      material: opt(d.material),
      dimensions: opt(d.dimensions),
      color: opt(d.color),
      specifications: opt(d.specifications),
      status: d.status ?? 'ACTIVE',
      featured: d.featured ?? false,
    } as const;
  }

  private async ensureSlugFree(slug: string, excludeId?: string) {
    const taken = await this.prisma.product.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    });
    if (taken) throw new BadRequestException('Slug sudah dipakai produk lain.');
  }

  async adminCreate(dto: ProductDto, user: JwtUser) {
    await this.ensureSlugFree(dto.slug);
    const cat = await this.prisma.category.findUnique({ where: { id: dto.categoryId }, select: { id: true } });
    if (!cat) throw new BadRequestException('Kategori tidak ditemukan.');
    if ((dto.imageUrls?.length ?? 0) > 8) throw new BadRequestException('Maksimal 8 gambar per produk.');
    const product = await this.prisma.product.create({
      data: { ...this.toData(dto), approvalStatus: 'APPROVED', createdById: user.sub },
    });
    if (dto.imageUrls?.length) {
      await this.prisma.productImage.createMany({
        data: dto.imageUrls.map((url, i) => ({
          productId: product.id, url, alt: `${product.name} foto ${i + 1}`, sortOrder: i, isMain: i === 0,
        })),
      });
    }
    return this.adminGet(product.id);
  }

  async adminUpdate(id: string, dto: ProductDto, user: JwtUser) {
    const current = await this.prisma.product.findUnique({
      where: { id }, select: { createdById: true, approvalStatus: true },
    });
    if (!current) throw new NotFoundException('Produk tidak ditemukan.');
    await assertAdminCanModify({ ...current, adminId: user.sub, kind: 'edit' }, async (cid) =>
      this.prisma.user.findUnique({ where: { id: cid }, select: { isActive: true } }),
    );
    await this.ensureSlugFree(dto.slug, id);
    return this.prisma.product.update({ where: { id }, data: { ...this.toData(dto) } });
  }

  async adminDelete(id: string, user: JwtUser) {
    const row = await this.prisma.product.findUnique({
      where: { id }, select: { createdById: true, approvalStatus: true },
    });
    if (!row) throw new NotFoundException('Produk tidak ditemukan.');
    await assertAdminCanModify({ ...row, adminId: user.sub, kind: 'delete' }, async (cid) =>
      this.prisma.user.findUnique({ where: { id: cid }, select: { isActive: true } }),
    );
    const images = await this.prisma.productImage.findMany({ where: { productId: id }, select: { url: true } });
    await this.prisma.product.delete({ where: { id } });
    await Promise.all(images.map((i) => this.upload.remove(i.url)));
    return { id };
  }

  async adminAddImages(productId: string, urls: string[], user: JwtUser) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, slug: true, name: true, createdById: true, approvalStatus: true, _count: { select: { images: true } } },
    });
    if (!product) throw new NotFoundException('Produk tidak ditemukan.');
    await assertAdminCanModify(
      { createdById: product.createdById, approvalStatus: product.approvalStatus, adminId: user.sub, kind: 'edit' },
      async (cid) => this.prisma.user.findUnique({ where: { id: cid }, select: { isActive: true } }),
    );
    if (product._count.images + urls.length > 8) {
      throw new BadRequestException(`Maksimal 8 gambar per produk (saat ini ${product._count.images}).`);
    }
    await this.prisma.productImage.createMany({
      data: urls.map((url, i) => ({
        productId, url, alt: `${product.name} foto ${product._count.images + i + 1}`,
        sortOrder: product._count.images + i, isMain: product._count.images === 0 && i === 0,
      })),
    });
    return this.adminGet(productId);
  }

  async setMainImage(productId: string, imageId: string, user: JwtUser) {
    const owner = await this.prisma.product.findUnique({
      where: { id: productId }, select: { createdById: true, approvalStatus: true },
    });
    if (!owner) throw new NotFoundException('Produk tidak ditemukan.');
    if (user.role === 'ADMIN') {
      await assertAdminCanModify({ ...owner, adminId: user.sub, kind: 'edit' }, async (cid) =>
        this.prisma.user.findUnique({ where: { id: cid }, select: { isActive: true } }),
      );
    } else {
      assertOwnerOrAdmin(owner.createdById, user);
    }
    await this.prisma.$transaction([
      this.prisma.productImage.updateMany({ where: { productId }, data: { isMain: false } }),
      this.prisma.productImage.update({ where: { id: imageId }, data: { isMain: true } }),
    ]);
    return { productId, imageId };
  }

  async deleteImage(productId: string, imageId: string, user: JwtUser, opts?: { blockPending?: boolean }) {
    const owner = await this.prisma.product.findUnique({
      where: { id: productId }, select: { createdById: true, approvalStatus: true },
    });
    if (!owner) throw new NotFoundException('Produk tidak ditemukan.');
    if (opts?.blockPending && owner.approvalStatus === 'PENDING') {
      throw new ForbiddenException('Data yang sedang direview tidak dapat diubah.');
    }
    if (user.role === 'ADMIN') {
      await assertAdminCanModify({ ...owner, adminId: user.sub, kind: 'edit' }, async (cid) =>
        this.prisma.user.findUnique({ where: { id: cid }, select: { isActive: true } }),
      );
    } else {
      assertOwnerOrAdmin(owner.createdById, user);
    }
    const image = await this.prisma.productImage.findUnique({
      where: { id: imageId }, select: { url: true, productId: true, isMain: true },
    });
    if (!image || image.productId !== productId) throw new NotFoundException('Gambar tidak ditemukan.');
    await this.prisma.productImage.delete({ where: { id: imageId } });
    await this.upload.remove(image.url);
    if (image.isMain) {
      const next = await this.prisma.productImage.findFirst({ where: { productId }, orderBy: { sortOrder: 'asc' } });
      if (next) await this.prisma.productImage.update({ where: { id: next.id }, data: { isMain: true } });
    }
    return { productId, imageId };
  }

  // ---------- WORKER ----------
  private async ownedProduct(id: string, user: JwtUser) {
    const p = await this.prisma.product.findUnique({
      where: { id },
      select: { id: true, slug: true, name: true, approvalStatus: true, createdById: true, _count: { select: { images: true } } },
    });
    if (!p) throw new NotFoundException('Produk tidak ditemukan.');
    assertOwnerOrAdmin(p.createdById, user);
    return p;
  }

  async workerList(user: JwtUser, page = 1) {
    const where = { createdById: user.sub };
    const [total, items] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * ADMIN_PAGE_SIZE,
        take: ADMIN_PAGE_SIZE,
        select: {
          id: true, name: true, slug: true, status: true, approvalStatus: true,
          rejectionReason: true, updatedAt: true,
          category: { select: { name: true } },
          _count: { select: { images: true } },
        },
      }),
    ]);
    return { items, total, totalPages: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)) };
  }

  async workerGet(id: string, user: JwtUser) {
    const p = await this.prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: 'asc' } }, category: true },
    });
    if (!p) throw new NotFoundException('Produk tidak ditemukan.');
    if (user.role !== 'ADMIN' && p.createdById !== user.sub) {
      throw new ForbiddenException('Anda hanya dapat mengelola data milik sendiri.');
    }
    return p;
  }

  async workerCreate(dto: ProductDto, user: JwtUser) {
    await this.ensureSlugFree(dto.slug);
    if ((dto.imageUrls?.length ?? 0) > 8) throw new BadRequestException('Maksimal 8 gambar per produk.');
    const product = await this.prisma.product.create({
      data: { ...this.toData({ ...dto, featured: false }), featured: false, approvalStatus: 'DRAFT', createdById: user.sub },
    });
    if (dto.imageUrls?.length) {
      await this.prisma.productImage.createMany({
        data: dto.imageUrls.map((url, i) => ({
          productId: product.id, url, alt: `${product.name} foto ${i + 1}`, sortOrder: i, isMain: i === 0,
        })),
      });
    }
    await this.activity.logActivity({ actorId: user.sub, action: 'CREATE', entityType: 'product', entityId: product.id, toStatus: 'DRAFT' });
    return this.workerGet(product.id, user);
  }

  async workerUpdate(id: string, dto: ProductDto, user: JwtUser) {
    const current = await this.ownedProduct(id, user);
    if (current.approvalStatus === 'PENDING') {
      throw new ForbiddenException('Data yang sedang direview tidak dapat diubah.');
    }
    await this.ensureSlugFree(dto.slug, id);
    await this.prisma.product.update({
      where: { id },
      data: {
        ...this.toData({ ...dto, featured: false }),
        featured: false,
        ...(current.approvalStatus === 'APPROVED'
          ? { approvalStatus: 'PENDING' as const, submittedAt: new Date(), rejectionReason: null }
          : {}),
      },
    });
    await this.activity.logActivity({
      actorId: user.sub, action: 'UPDATE', entityType: 'product', entityId: id,
      fromStatus: current.approvalStatus,
      toStatus: current.approvalStatus === 'APPROVED' ? 'PENDING' : undefined,
    });
    if (current.approvalStatus === 'APPROVED') {
      await this.activity.notifyAdmins({
        type: 'SUBMITTED',
        title: `Revisi produk: ${dto.name}`,
        message: `${user.name ?? user.email} mengubah produk tayang, menunggu review ulang.`,
        link: '/admin/approvals',
      });
    }
    return this.workerGet(id, user);
  }

  async workerDelete(id: string, user: JwtUser) {
    const current = await this.ownedProduct(id, user);
    if (current.approvalStatus !== 'DRAFT' && current.approvalStatus !== 'REJECTED') {
      throw new ForbiddenException('Hanya draf atau yang ditolak yang dapat dihapus.');
    }
    const images = await this.prisma.productImage.findMany({ where: { productId: id }, select: { url: true } });
    await this.prisma.product.delete({ where: { id } });
    await Promise.all(images.map((i) => this.upload.remove(i.url)));
    await this.activity.logActivity({ actorId: user.sub, action: 'DELETE', entityType: 'product', entityId: id, fromStatus: current.approvalStatus });
    return { id };
  }

  async workerSubmit(id: string, user: JwtUser) {
    const current = await this.ownedProduct(id, user);
    if (current.approvalStatus !== 'DRAFT' && current.approvalStatus !== 'REJECTED') {
      throw new ForbiddenException('Hanya draf yang dapat diajukan.');
    }
    await this.prisma.product.update({
      where: { id }, data: { approvalStatus: 'PENDING', submittedAt: new Date(), rejectionReason: null },
    });
    await this.activity.logActivity({ actorId: user.sub, action: 'SUBMIT', entityType: 'product', entityId: id, fromStatus: current.approvalStatus, toStatus: 'PENDING' });
    await this.activity.notifyAdmins({
      type: 'SUBMITTED',
      title: `Pengajuan produk: ${current.name}`,
      message: `${user.name ?? user.email} mengajukan produk untuk direview.`,
      link: '/admin/approvals',
    });
    return this.workerGet(id, user);
  }

  async workerAddImages(productId: string, urls: string[], user: JwtUser) {
    const product = await this.ownedProduct(productId, user);
    if (product.approvalStatus === 'PENDING') {
      throw new ForbiddenException('Data yang sedang direview tidak dapat diubah.');
    }
    if (product._count.images + urls.length > 8) {
      throw new BadRequestException('Maksimal 8 gambar per produk.');
    }
    await this.prisma.productImage.createMany({
      data: urls.map((url, i) => ({
        productId, url, alt: `${product.name} foto ${product._count.images + i + 1}`,
        sortOrder: product._count.images + i, isMain: product._count.images === 0 && i === 0,
      })),
    });
    return this.workerGet(productId, user);
  }
}
