import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { JwtUser } from '../../common/decorators/current-user.decorator.js';
import { CategoriesService } from './categories.service.js';
import { CategoryDto } from './dto/category.dto.js';

@Controller()
export class CategoriesController {
  constructor(private categories: CategoriesService) {}

  @Get('categories')
  listPublic() {
    return this.categories.listPublic();
  }

  @Get('admin/categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminList() {
    return this.categories.adminList();
  }

  @Post('admin/categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminCreate(@Body() dto: CategoryDto, @CurrentUser() u: JwtUser) {
    return this.categories.adminCreate(dto, u);
  }

  @Patch('admin/categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminUpdate(@Param('id') id: string, @Body() dto: CategoryDto, @CurrentUser() u: JwtUser) {
    return this.categories.adminUpdate(id, dto, u);
  }

  @Delete('admin/categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminDelete(@Param('id') id: string, @CurrentUser() u: JwtUser) {
    return this.categories.adminDelete(id, u);
  }

  @Get('worker/categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'WORKER')
  workerList(@CurrentUser() u: JwtUser) {
    return this.categories.workerList(u);
  }

  @Post('worker/categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'WORKER')
  workerCreate(@Body() dto: CategoryDto, @CurrentUser() u: JwtUser) {
    return this.categories.workerCreate(dto, u);
  }

  @Patch('worker/categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'WORKER')
  workerUpdate(@Param('id') id: string, @Body() dto: CategoryDto, @CurrentUser() u: JwtUser) {
    return this.categories.workerUpdate(id, dto, u);
  }

  @Delete('worker/categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'WORKER')
  workerDelete(@Param('id') id: string, @CurrentUser() u: JwtUser) {
    return this.categories.workerDelete(id, u);
  }

  @Post('worker/categories/:id/submit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'WORKER')
  workerSubmit(@Param('id') id: string, @CurrentUser() u: JwtUser) {
    return this.categories.workerSubmit(id, u);
  }
}
