import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { JwtUser } from '../../common/decorators/current-user.decorator.js';
import { InquiriesService } from './inquiries.service.js';
import { CreateInquiryDto, UpdateInquiryStatusDto } from './dto/inquiry.dto.js';

@Controller()
export class InquiriesController {
  constructor(private inquiries: InquiriesService) {}

  /** Public, rate limited menyamai proteksi lama: 5x / 10 menit per IP */
  @Throttle({ default: { limit: 5, ttl: 600_000, blockDuration: 600_000 } })
  @Post('inquiries')
  create(@Body() dto: CreateInquiryDto) {
    return this.inquiries.create(dto);
  }

  @Get('admin/inquiries')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminList(@Query('status') status?: string, @Query('q') q?: string, @Query('page') page?: string) {
    return this.inquiries.adminList(status, q, Number(page) || 1);
  }

  @Get('admin/inquiries/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminGet(@Param('id') id: string) {
    return this.inquiries.adminGet(id);
  }

  @Patch('admin/inquiries/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminUpdate(@Param('id') id: string, @Body() dto: UpdateInquiryStatusDto) {
    return this.inquiries.updateStatus(id, dto);
  }

  @Delete('admin/inquiries/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminDelete(@Param('id') id: string) {
    return this.inquiries.delete(id);
  }

  @Get('worker/inquiries')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'WORKER')
  workerList(@Query('status') status?: string, @Query('q') q?: string, @Query('page') page?: string) {
    return this.inquiries.adminList(status, q, Number(page) || 1);
  }

  @Get('worker/inquiries/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'WORKER')
  workerGet(@Param('id') id: string) {
    return this.inquiries.workerGet(id);
  }

  @Patch('worker/inquiries/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'WORKER')
  workerProcess(@Param('id') id: string, @Body() dto: UpdateInquiryStatusDto, @CurrentUser() u: JwtUser) {
    return this.inquiries.updateStatus(id, dto, u);
  }
}
