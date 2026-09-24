import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { JwtUser } from '../../common/decorators/current-user.decorator.js';
import { PublicDashboardController, SitemapController } from './public-dashboard.controller.js';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async adminStats() {
    const [products, portfolios, articles, inquiries, newInquiries, byStatus] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.portfolio.count(),
      this.prisma.article.count(),
      this.prisma.inquiry.count(),
      this.prisma.inquiry.count({ where: { status: 'NEW' } }),
      this.prisma.inquiry.groupBy({ by: ['status'], _count: { status: true } }),
    ]);
    const statusMap = Object.fromEntries(byStatus.map((s) => [s.status, s._count.status])) as Record<string, number>;
    return {
      products, portfolios, articles, inquiries, newInquiries,
      byStatus: {
        NEW: statusMap.NEW ?? 0,
        CONTACTED: statusMap.CONTACTED ?? 0,
        PROCESSING: statusMap.PROCESSING ?? 0,
        COMPLETED: statusMap.COMPLETED ?? 0,
        CANCELLED: statusMap.CANCELLED ?? 0,
      },
    };
  }

  async recentInquiries(limit = 8) {
    return this.prisma.inquiry.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true, name: true, whatsapp: true, quantity: true, status: true, createdAt: true,
        product: { select: { name: true } },
      },
    });
  }

  async recentSubmissions(limit = 6) {
    const [products, articles, galleries] = await Promise.all([
      this.prisma.product.findMany({
        where: { approvalStatus: { in: ['PENDING', 'REJECTED'] } },
        orderBy: { updatedAt: 'desc' }, take: limit,
        select: { id: true, name: true, approvalStatus: true, updatedAt: true, createdBy: { select: { name: true, email: true } } },
      }),
      this.prisma.article.findMany({
        where: { approvalStatus: { in: ['PENDING', 'REJECTED'] } },
        orderBy: { updatedAt: 'desc' }, take: limit,
        select: { id: true, title: true, approvalStatus: true, updatedAt: true, createdBy: { select: { name: true, email: true } } },
      }),
      this.prisma.gallery.findMany({
        where: { approvalStatus: { in: ['PENDING', 'REJECTED'] } },
        orderBy: { createdAt: 'desc' }, take: limit,
        select: { id: true, title: true, approvalStatus: true, createdBy: { select: { name: true, email: true } } },
      }),
    ]);
    return [
      ...products.map((p) => ({ kind: 'Produk', ...p, label: p.name })),
      ...articles.map((a) => ({ kind: 'Artikel', ...a, label: a.title })),
      ...galleries.map((g) => ({ kind: 'Galeri', ...g, label: g.title })),
    ].slice(0, limit);
  }

  async publicCounts() {
    const [products, portfolios, articles] = await Promise.all([
      this.prisma.product.count({ where: { status: 'ACTIVE', approvalStatus: 'APPROVED' } }),
      this.prisma.portfolio.count(),
      this.prisma.article.count({ where: { status: 'PUBLISHED', approvalStatus: 'APPROVED' } }),
    ]);
    return { products, portfolios, articles };
  }

  async workerDashboard(userId: string) {
    const mine = { createdById: userId };
    const [products, articles, galleries, pending, approved, rejected, newInquiries] = await Promise.all([
      this.prisma.product.count({ where: mine }),
      this.prisma.article.count({ where: mine }),
      this.prisma.gallery.count({ where: mine }),
      Promise.all([
        this.prisma.product.count({ where: { ...mine, approvalStatus: 'PENDING' } }),
        this.prisma.article.count({ where: { ...mine, approvalStatus: 'PENDING' } }),
        this.prisma.gallery.count({ where: { ...mine, approvalStatus: 'PENDING' } }),
        this.prisma.category.count({ where: { ...mine, approvalStatus: 'PENDING' } }),
      ]).then(([p, a, g, c]) => p + a + g + c),
      Promise.all([
        this.prisma.product.count({ where: { ...mine, approvalStatus: 'APPROVED' } }),
        this.prisma.article.count({ where: { ...mine, approvalStatus: 'APPROVED' } }),
        this.prisma.gallery.count({ where: { ...mine, approvalStatus: 'APPROVED' } }),
        this.prisma.category.count({ where: { ...mine, approvalStatus: 'APPROVED' } }),
      ]).then(([p, a, g, c]) => p + a + g + c),
      Promise.all([
        this.prisma.product.count({ where: { ...mine, approvalStatus: 'REJECTED' } }),
        this.prisma.article.count({ where: { ...mine, approvalStatus: 'REJECTED' } }),
        this.prisma.gallery.count({ where: { ...mine, approvalStatus: 'REJECTED' } }),
        this.prisma.category.count({ where: { ...mine, approvalStatus: 'REJECTED' } }),
      ]).then(([p, a, g, c]) => p + a + g + c),
      this.prisma.inquiry.count({ where: { status: 'NEW' } }),
    ]);
    const [prods, arts, gals, cats] = await Promise.all([
      this.prisma.product.findMany({
        where: { ...mine, approvalStatus: { in: ['PENDING', 'REJECTED'] } },
        orderBy: { updatedAt: 'desc' }, take: 5,
        select: { id: true, name: true, approvalStatus: true, rejectionReason: true, updatedAt: true },
      }),
      this.prisma.article.findMany({
        where: { ...mine, approvalStatus: { in: ['PENDING', 'REJECTED'] } },
        orderBy: { updatedAt: 'desc' }, take: 5,
        select: { id: true, title: true, approvalStatus: true, rejectionReason: true, updatedAt: true },
      }),
      this.prisma.gallery.findMany({
        where: { ...mine, approvalStatus: { in: ['PENDING', 'REJECTED'] } },
        orderBy: { id: 'desc' }, take: 5,
        select: { id: true, title: true, approvalStatus: true, rejectionReason: true },
      }),
      this.prisma.category.findMany({
        where: { ...mine, approvalStatus: { in: ['PENDING', 'REJECTED'] } },
        orderBy: { updatedAt: 'desc' }, take: 5,
        select: { id: true, name: true, approvalStatus: true, rejectionReason: true, updatedAt: true },
      }),
    ]);
    const attention = [
      ...prods.map((p) => ({ kind: 'Produk', ...p, label: p.name })),
      ...arts.map((a) => ({ kind: 'Artikel', ...a, label: a.title })),
      ...gals.map((g) => ({ kind: 'Galeri', ...g, label: g.title })),
      ...cats.map((c) => ({ kind: 'Kategori', ...c, label: c.name })),
    ].slice(0, 8);
    return { products, articles, galleries, pending, approved, rejected, newInquiries, attention };
  }

  async workerSubmissions(userId: string) {
    const [products, articles, galleries, categories] = await Promise.all([
      this.prisma.product.findMany({
        where: { createdById: userId, approvalStatus: { in: ['PENDING', 'REJECTED'] } },
        orderBy: { updatedAt: 'desc' },
        select: { id: true, name: true, approvalStatus: true, rejectionReason: true, submittedAt: true, updatedAt: true },
      }),
      this.prisma.article.findMany({
        where: { createdById: userId, approvalStatus: { in: ['PENDING', 'REJECTED'] } },
        orderBy: { updatedAt: 'desc' },
        select: { id: true, title: true, approvalStatus: true, rejectionReason: true, submittedAt: true, updatedAt: true },
      }),
      this.prisma.gallery.findMany({
        where: { createdById: userId, approvalStatus: { in: ['PENDING', 'REJECTED'] } },
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, approvalStatus: true, rejectionReason: true, submittedAt: true },
      }),
      this.prisma.category.findMany({
        where: { createdById: userId, approvalStatus: { in: ['PENDING', 'REJECTED'] } },
        orderBy: { updatedAt: 'desc' },
        select: { id: true, name: true, approvalStatus: true, rejectionReason: true, submittedAt: true },
      }),
    ]);
    return [
      ...products.map((p) => ({ kind: 'Produk', href: `/worker/products/${p.id}`, ...p, label: p.name })),
      ...articles.map((a) => ({ kind: 'Artikel', href: `/worker/articles/${a.id}`, ...a, label: a.title })),
      ...galleries.map((g) => ({ kind: 'Galeri', href: '/worker/gallery', ...g, label: g.title })),
      ...categories.map((c) => ({ kind: 'Kategori', href: '/worker/categories', ...c, label: c.name })),
    ];
  }
}

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private dashboard: DashboardService) {}

  @Get('admin/dashboard/stats')
  @Roles('ADMIN')
  adminStats() {
    return this.dashboard.adminStats();
  }

  @Get('admin/dashboard/recent-inquiries')
  @Roles('ADMIN')
  recentInquiries(@Query('limit') limit?: string) {
    return this.dashboard.recentInquiries(Number(limit) || 8);
  }

  @Get('admin/dashboard/recent-submissions')
  @Roles('ADMIN')
  recentSubmissions(@Query('limit') limit?: string) {
    return this.dashboard.recentSubmissions(Number(limit) || 6);
  }

  @Get('worker/dashboard')
  @Roles('ADMIN', 'WORKER')
  workerDashboard(@CurrentUser() u: JwtUser) {
    return this.dashboard.workerDashboard(u.sub);
  }

  @Get('worker/submissions')
  @Roles('ADMIN', 'WORKER')
  workerSubmissions(@CurrentUser() u: JwtUser) {
    return this.dashboard.workerSubmissions(u.sub);
  }
}

@Module({
  controllers: [DashboardController, PublicDashboardController, SitemapController],
  providers: [DashboardService],
})
export class DashboardModule {}
