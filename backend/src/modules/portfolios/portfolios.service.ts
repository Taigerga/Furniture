import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { UploadService } from '../upload/upload.service.js';
import { AddPortfolioImagesDto, PortfolioDto } from './dto/portfolio.dto.js';

const ADMIN_PAGE_SIZE = 10;

@Injectable()
export class PortfoliosService {
  constructor(
    private prisma: PrismaService,
    private upload: UploadService,
  ) {}

  async listPublic() {
    return this.prisma.portfolio.findMany({
      orderBy: [{ featured: 'desc' }, { year: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true, title: true, slug: true, client: true, location: true, year: true,
        images: { orderBy: { sortOrder: 'asc' }, take: 1, select: { url: true, alt: true } },
      },
    });
  }

  async getBySlug(slug: string) {
    const p = await this.prisma.portfolio.findUnique({
      where: { slug },
      select: {
        id: true, title: true, slug: true, client: true, location: true, year: true, description: true,
        images: { orderBy: { sortOrder: 'asc' }, select: { url: true, alt: true } },
      },
    });
    if (!p) throw new NotFoundException('Portofolio tidak ditemukan.');
    return p;
  }

  async adminList(page = 1) {
    const [total, items] = await Promise.all([
      this.prisma.portfolio.count(),
      this.prisma.portfolio.findMany({
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * ADMIN_PAGE_SIZE,
        take: ADMIN_PAGE_SIZE,
        select: {
          id: true, title: true, slug: true, client: true, year: true, featured: true, updatedAt: true,
          _count: { select: { images: true } },
        },
      }),
    ]);
    return { items, total, totalPages: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)) };
  }

  async adminGet(id: string) {
    const p = await this.prisma.portfolio.findUnique({
      where: { id }, include: { images: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!p) throw new NotFoundException('Portofolio tidak ditemukan.');
    return p;
  }

  async adminCreate(dto: PortfolioDto) {
    if (await this.prisma.portfolio.findUnique({ where: { slug: dto.slug }, select: { id: true } })) {
      throw new BadRequestException('Slug sudah dipakai portofolio lain.');
    }
    if ((dto.imageUrls?.length ?? 0) > 10) throw new BadRequestException('Maksimal 10 gambar per proyek.');
    const pf = await this.prisma.portfolio.create({
      data: {
        title: dto.title, slug: dto.slug, client: dto.client || null, location: dto.location || null,
        year: dto.year ?? null, description: dto.description || null, featured: dto.featured ?? false,
      },
    });
    if (dto.imageUrls?.length) {
      await this.prisma.portfolioImage.createMany({
        data: dto.imageUrls.map((url, i) => ({ portfolioId: pf.id, url, alt: `${pf.title} ${i + 1}`, sortOrder: i })),
      });
    }
    return this.adminGet(pf.id);
  }

  async adminUpdate(id: string, dto: PortfolioDto) {
    if (await this.prisma.portfolio.findFirst({ where: { slug: dto.slug, id: { not: id } }, select: { id: true } })) {
      throw new BadRequestException('Slug sudah dipakai portofolio lain.');
    }
    await this.prisma.portfolio.update({
      where: { id },
      data: {
        title: dto.title, slug: dto.slug, client: dto.client || null, location: dto.location || null,
        year: dto.year ?? null, description: dto.description || null, featured: dto.featured ?? false,
      },
    }).catch(() => {
      throw new NotFoundException('Portofolio tidak ditemukan.');
    });
    return this.adminGet(id);
  }

  async adminDelete(id: string) {
    const images = await this.prisma.portfolioImage.findMany({ where: { portfolioId: id }, select: { url: true } });
    await this.prisma.portfolio.delete({ where: { id } }).catch(() => {
      throw new NotFoundException('Portofolio tidak ditemukan.');
    });
    await Promise.all(images.map((i) => this.upload.remove(i.url)));
    return { id };
  }

  async addImages(portfolioId: string, dto: AddPortfolioImagesDto) {
    const pf = await this.prisma.portfolio.findUnique({
      where: { id: portfolioId },
      select: { id: true, slug: true, title: true, _count: { select: { images: true } } },
    });
    if (!pf) throw new NotFoundException('Portofolio tidak ditemukan.');
    if (pf._count.images + dto.urls.length > 10) throw new BadRequestException('Maksimal 10 gambar per proyek.');
    await this.prisma.portfolioImage.createMany({
      data: dto.urls.map((url, i) => ({
        portfolioId, url, alt: `${pf.title} ${pf._count.images + i + 1}`, sortOrder: pf._count.images + i,
      })),
    });
    return this.adminGet(portfolioId);
  }

  async deleteImage(portfolioId: string, imageId: string) {
    const image = await this.prisma.portfolioImage.findUnique({ where: { id: imageId }, select: { url: true, portfolioId: true } });
    if (!image || image.portfolioId !== portfolioId) throw new NotFoundException('Gambar tidak ditemukan.');
    await this.prisma.portfolioImage.delete({ where: { id: imageId } });
    await this.upload.remove(image.url);
    return { portfolioId, imageId };
  }
}
