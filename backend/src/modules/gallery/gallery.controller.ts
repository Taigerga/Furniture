import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { JwtUser } from '../../common/decorators/current-user.decorator.js';
import { GalleryService } from './gallery.service.js';
import { GalleryDto } from './dto/gallery.dto.js';

@Controller()
export class GalleryController {
  constructor(private gallery: GalleryService) {}

  @Get('gallery')
  listPublic() {
    return this.gallery.listPublic();
  }

  @Get('admin/gallery')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminList(@Query('category') category?: string, @Query('page') page?: string) {
    return this.gallery.adminList(category, Number(page) || 1);
  }

  @Post('admin/gallery')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminCreate(@Body() dto: GalleryDto, @CurrentUser() u: JwtUser) {
    return this.gallery.adminCreate(dto, u);
  }

  @Patch('admin/gallery/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminUpdate(@Param('id') id: string, @Body() dto: GalleryDto, @CurrentUser() u: JwtUser) {
    return this.gallery.adminUpdate(id, dto, u);
  }

  @Delete('admin/gallery/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminDelete(@Param('id') id: string, @CurrentUser() u: JwtUser) {
    return this.gallery.adminDelete(id, u);
  }

  @Get('worker/gallery')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'WORKER')
  workerList(@CurrentUser() u: JwtUser, @Query('page') page?: string) {
    return this.gallery.workerList(u, Number(page) || 1);
  }

  @Get('worker/gallery/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'WORKER')
  workerGet(@Param('id') id: string, @CurrentUser() u: JwtUser) {
    return this.gallery.workerGet(id, u);
  }

  @Post('worker/gallery')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'WORKER')
  workerCreate(@Body() dto: GalleryDto, @CurrentUser() u: JwtUser) {
    return this.gallery.workerCreate(dto, u);
  }

  @Patch('worker/gallery/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'WORKER')
  workerUpdate(@Param('id') id: string, @Body() dto: GalleryDto, @CurrentUser() u: JwtUser) {
    return this.gallery.workerUpdate(id, dto, u);
  }

  @Delete('worker/gallery/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'WORKER')
  workerDelete(@Param('id') id: string, @CurrentUser() u: JwtUser) {
    return this.gallery.workerDelete(id, u);
  }

  @Post('worker/gallery/:id/submit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'WORKER')
  workerSubmit(@Param('id') id: string, @CurrentUser() u: JwtUser) {
    return this.gallery.workerSubmit(id, u);
  }
}
