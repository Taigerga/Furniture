import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { JwtUser } from '../../common/decorators/current-user.decorator.js';
import { ArticlesService } from './articles.service.js';
import { ArticleDto } from './dto/article.dto.js';

@Controller()
export class ArticlesController {
  constructor(private articles: ArticlesService) {}

  @Get('articles')
  listPublished() {
    return this.articles.listPublished();
  }

  @Get('articles/:slug')
  bySlug(@Param('slug') slug: string) {
    return this.articles.getBySlug(slug);
  }

  @Get('admin/articles')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminList(@Query('status') status?: string, @Query('page') page?: string) {
    return this.articles.adminList(status, Number(page) || 1);
  }

  @Get('admin/articles/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminGet(@Param('id') id: string) {
    return this.articles.adminGet(id);
  }

  @Post('admin/articles')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminCreate(@Body() dto: ArticleDto, @CurrentUser() u: JwtUser) {
    return this.articles.adminCreate(dto, u);
  }

  @Patch('admin/articles/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminUpdate(@Param('id') id: string, @Body() dto: ArticleDto, @CurrentUser() u: JwtUser) {
    return this.articles.adminUpdate(id, dto, u);
  }

  @Delete('admin/articles/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminDelete(@Param('id') id: string, @CurrentUser() u: JwtUser) {
    return this.articles.adminDelete(id, u);
  }

  @Get('worker/articles')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'WORKER')
  workerList(@CurrentUser() u: JwtUser, @Query('page') page?: string) {
    return this.articles.workerList(u, Number(page) || 1);
  }

  @Get('worker/articles/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'WORKER')
  workerGet(@Param('id') id: string, @CurrentUser() u: JwtUser) {
    return this.articles.workerGet(id, u);
  }

  @Post('worker/articles')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'WORKER')
  workerCreate(@Body() dto: ArticleDto, @CurrentUser() u: JwtUser) {
    return this.articles.workerCreate(dto, u);
  }

  @Patch('worker/articles/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'WORKER')
  workerUpdate(@Param('id') id: string, @Body() dto: ArticleDto, @CurrentUser() u: JwtUser) {
    return this.articles.workerUpdate(id, dto, u);
  }

  @Delete('worker/articles/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'WORKER')
  workerDelete(@Param('id') id: string, @CurrentUser() u: JwtUser) {
    return this.articles.workerDelete(id, u);
  }

  @Post('worker/articles/:id/submit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'WORKER')
  workerSubmit(@Param('id') id: string, @CurrentUser() u: JwtUser) {
    return this.articles.workerSubmit(id, u);
  }
}
