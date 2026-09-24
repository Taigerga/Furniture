import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { PortfoliosService } from './portfolios.service.js';
import { AddPortfolioImagesDto, PortfolioDto } from './dto/portfolio.dto.js';

@Controller()
export class PortfoliosController {
  constructor(private portfolios: PortfoliosService) {}

  @Get('portfolios')
  listPublic() {
    return this.portfolios.listPublic();
  }

  @Get('portfolios/:slug')
  bySlug(@Param('slug') slug: string) {
    return this.portfolios.getBySlug(slug);
  }

  @Get('admin/portfolios')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminList(@Query('page') page?: string) {
    return this.portfolios.adminList(Number(page) || 1);
  }

  @Get('admin/portfolios/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminGet(@Param('id') id: string) {
    return this.portfolios.adminGet(id);
  }

  @Post('admin/portfolios')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminCreate(@Body() dto: PortfolioDto) {
    return this.portfolios.adminCreate(dto);
  }

  @Patch('admin/portfolios/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminUpdate(@Param('id') id: string, @Body() dto: PortfolioDto) {
    return this.portfolios.adminUpdate(id, dto);
  }

  @Delete('admin/portfolios/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminDelete(@Param('id') id: string) {
    return this.portfolios.adminDelete(id);
  }

  @Post('admin/portfolios/:id/images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  addImages(@Param('id') id: string, @Body() dto: AddPortfolioImagesDto) {
    return this.portfolios.addImages(id, dto);
  }

  @Delete('admin/portfolios/:portfolioId/images/:imageId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  deleteImage(@Param('portfolioId') pid: string, @Param('imageId') iid: string) {
    return this.portfolios.deleteImage(pid, iid);
  }
}
