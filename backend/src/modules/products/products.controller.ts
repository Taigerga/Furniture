import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { JwtUser } from '../../common/decorators/current-user.decorator.js';
import { ProductsService } from './products.service.js';
import { AddImagesDto, ProductDto } from './dto/product.dto.js';

@Controller()
export class ProductsController {
  constructor(private products: ProductsService) {}

  // PUBLIC
  @Get('products')
  listPublic(@Query('q') q?: string, @Query('category') category?: string, @Query('page') page?: string) {
    return this.products.listPublic(q, category, Number(page) || 1);
  }

  @Get('products/featured')
  featured(@Query('limit') limit?: string) {
    return this.products.getFeatured(Number(limit) || 6);
  }

  @Get('products/all')
  allActive() {
    return this.products.getAllActive();
  }

  @Get('products/:slug')
  bySlug(@Param('slug') slug: string) {
    return this.products.getBySlug(slug);
  }

  @Get('products/:slug/related/:id')
  related(@Param('slug') slug: string, @Param('id') id: string, @Query('limit') limit?: string) {
    return this.products.getRelated(slug, id, Number(limit) || 4);
  }

  // ADMIN
  @Get('admin/products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminList(@Query('q') q?: string, @Query('status') status?: string, @Query('page') page?: string) {
    return this.products.adminList(q, status, Number(page) || 1);
  }

  @Get('admin/products/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminGet(@Param('id') id: string) {
    return this.products.adminGet(id);
  }

  @Post('admin/products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminCreate(@Body() dto: ProductDto, @CurrentUser() u: JwtUser) {
    return this.products.adminCreate(dto, u);
  }

  @Patch('admin/products/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminUpdate(@Param('id') id: string, @Body() dto: ProductDto, @CurrentUser() u: JwtUser) {
    return this.products.adminUpdate(id, dto, u);
  }

  @Delete('admin/products/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminDelete(@Param('id') id: string, @CurrentUser() u: JwtUser) {
    return this.products.adminDelete(id, u);
  }

  @Post('admin/products/:id/images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminAddImages(@Param('id') id: string, @Body() dto: AddImagesDto, @CurrentUser() u: JwtUser) {
    return this.products.adminAddImages(id, dto.urls, u);
  }

  @Patch('products/:productId/images/:imageId/main')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'WORKER')
  setMain(@Param('productId') pid: string, @Param('imageId') iid: string, @CurrentUser() u: JwtUser) {
    return this.products.setMainImage(pid, iid, u);
  }

  @Delete('admin/products/:productId/images/:imageId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminDeleteImage(@Param('productId') pid: string, @Param('imageId') iid: string, @CurrentUser() u: JwtUser) {
    return this.products.deleteImage(pid, iid, u);
  }

  // WORKER
  @Get('worker/products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'WORKER')
  workerList(@CurrentUser() u: JwtUser, @Query('page') page?: string) {
    return this.products.workerList(u, Number(page) || 1);
  }

  @Get('worker/products/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'WORKER')
  workerGet(@Param('id') id: string, @CurrentUser() u: JwtUser) {
    return this.products.workerGet(id, u);
  }

  @Post('worker/products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'WORKER')
  workerCreate(@Body() dto: ProductDto, @CurrentUser() u: JwtUser) {
    return this.products.workerCreate(dto, u);
  }

  @Patch('worker/products/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'WORKER')
  workerUpdate(@Param('id') id: string, @Body() dto: ProductDto, @CurrentUser() u: JwtUser) {
    return this.products.workerUpdate(id, dto, u);
  }

  @Delete('worker/products/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'WORKER')
  workerDelete(@Param('id') id: string, @CurrentUser() u: JwtUser) {
    return this.products.workerDelete(id, u);
  }

  @Post('worker/products/:id/submit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'WORKER')
  workerSubmit(@Param('id') id: string, @CurrentUser() u: JwtUser) {
    return this.products.workerSubmit(id, u);
  }

  @Post('worker/products/:id/images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'WORKER')
  workerAddImages(@Param('id') id: string, @Body() dto: AddImagesDto, @CurrentUser() u: JwtUser) {
    return this.products.workerAddImages(id, dto.urls, u);
  }

  @Delete('worker/products/:productId/images/:imageId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'WORKER')
  workerDeleteImage(@Param('productId') pid: string, @Param('imageId') iid: string, @CurrentUser() u: JwtUser) {
    return this.products.deleteImage(pid, iid, u, { blockPending: true });
  }
}
