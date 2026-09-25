import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ActivityService } from '../../common/utils/activity.service.js';
import { JwtUser } from '../../common/decorators/current-user.decorator.js';
import { CreateInquiryDto, UpdateInquiryStatusDto } from './dto/inquiry.dto.js';

const ADMIN_PAGE_SIZE = 10;

@Injectable()
export class InquiriesService {
  constructor(
    private prisma: PrismaService,
    private activity: ActivityService,
  ) {}

  async create(dto: CreateInquiryDto) {
    if (dto.productId) {
      const exists = await this.prisma.product.findUnique({ where: { id: dto.productId }, select: { id: true } });
      if (!exists) throw new BadRequestException('Produk yang dipilih tidak ditemukan.');
    }
    const created = await this.prisma.inquiry.create({
      data: {
        name: dto.name.trim(),
        email: dto.email.toLowerCase().trim(),
        whatsapp: dto.whatsapp.trim(),
        quantity: dto.quantity,
        message: dto.message.trim(),
        productId: dto.productId || undefined,
      },
      include: { product: { select: { name: true } } },
    });
    await this.activity.notifyAdmins({
      type: 'INQUIRY_NEW',
      title: `Inquiry baru dari ${created.name}`,
      message: `${created.quantity} pcs — ${created.message.slice(0, 120)}`,
      link: '/admin/inquiries',
    }).catch(() => undefined);
    // productName dikembalikan supaya frontend bisa menyusun pesan WhatsApp
    // pelanggan tanpa perlu fetch ulang.
    return { id: created.id, productName: created.product?.name ?? null };
  }

  private buildWhere(status?: string, q?: string) {
    return {
      ...(status ? { status: status as never } : {}),
      ...(q ? { OR: [{ name: { contains: q } }, { email: { contains: q } }, { whatsapp: { contains: q } }] } : {}),
    };
  }

  async adminList(status?: string, q?: string, page = 1) {
    const where = this.buildWhere(status, q);
    const [total, items] = await Promise.all([
      this.prisma.inquiry.count({ where }),
      this.prisma.inquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * ADMIN_PAGE_SIZE,
        take: ADMIN_PAGE_SIZE,
        select: {
          id: true, name: true, email: true, whatsapp: true, quantity: true,
          // message ikut diambil agar dashboard bisa menyusun pesan balas
          // WhatsApp tanpa harus membuka tiap detail.
          message: true,
          status: true, createdAt: true, product: { select: { name: true } },
        },
      }),
    ]);
    return { items, total, totalPages: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)) };
  }

  async adminGet(id: string) {
    const row = await this.prisma.inquiry.findUnique({
      where: { id },
      include: { product: { select: { name: true, slug: true } } },
    });
    if (!row) throw new NotFoundException('Inquiry tidak ditemukan.');
    return row;
  }

  async updateStatus(id: string, dto: UpdateInquiryStatusDto, user?: JwtUser) {
    const current = await this.prisma.inquiry.findUnique({ where: { id }, select: { status: true } });
    if (!current) throw new NotFoundException('Inquiry tidak ditemukan.');
    await this.prisma.inquiry.update({
      where: { id },
      data: { status: dto.status, ...(user ? { handledById: user.sub } : {}) },
    });
    if (user) {
      await this.activity.logActivity({
        actorId: user.sub, action: 'PROCESS_INQUIRY', entityType: 'inquiry', entityId: id,
        fromStatus: current.status, toStatus: dto.status,
      });
    }
    return this.adminGet(id);
  }

  async delete(id: string) {
    await this.prisma.inquiry.delete({ where: { id } }).catch(() => {
      throw new NotFoundException('Inquiry tidak ditemukan.');
    });
    return { id };
  }

  async workerGet(id: string) {
    const row = await this.prisma.inquiry.findUnique({
      where: { id },
      include: { product: { select: { name: true, slug: true } }, handledBy: { select: { name: true } } },
    });
    if (!row) throw new NotFoundException('Inquiry tidak ditemukan.');
    return row;
  }
}
