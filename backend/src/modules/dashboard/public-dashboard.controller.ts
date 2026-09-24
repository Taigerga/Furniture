import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Controller('public')
export class PublicDashboardController {
  constructor(private prisma: PrismaService) {}

  @Get('counts')
  async counts() {
    const [products, portfolios, articles] = await Promise.all([
      this.prisma.product.count({ where: { status: 'ACTIVE', approvalStatus: 'APPROVED' } }),
      this.prisma.portfolio.count(),
      this.prisma.article.count({ where: { status: 'PUBLISHED', approvalStatus: 'APPROVED' } }),
    ]);
    return { products, portfolios, articles };
  }
}

@Controller('sitemap')
export class SitemapController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async sitemap() {
    const [products, portfolios, articles] = await Promise.all([
      this.prisma.product.findMany({
        where: { status: 'ACTIVE', approvalStatus: 'APPROVED' },
        select: { slug: true, updatedAt: true },
      }),
      this.prisma.portfolio.findMany({ select: { slug: true, updatedAt: true } }),
      this.prisma.article.findMany({
        where: { status: 'PUBLISHED', approvalStatus: 'APPROVED' },
        select: { slug: true, updatedAt: true },
      }),
    ]);
    return { products, portfolios, articles };
  }
}
