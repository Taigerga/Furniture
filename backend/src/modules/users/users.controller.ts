import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { JwtUser } from '../../common/decorators/current-user.decorator.js';
import { UsersService } from './users.service.js';
import {
  ChangePasswordDto,
  CreateWorkerDto,
  ResetPasswordDto,
  ToggleActiveDto,
  UpdateAccountDto,
} from './dto/user.dto.js';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private users: UsersService) {}

  @Get('admin/users/workers')
  @Roles('ADMIN')
  listWorkers() {
    return this.users.listWorkers();
  }

  @Post('admin/users/workers')
  @Roles('ADMIN')
  createWorker(@Body() dto: CreateWorkerDto) {
    return this.users.createWorker(dto.name, dto.email, dto.password);
  }

  @Patch('admin/users/workers/:id/active')
  @Roles('ADMIN')
  toggleActive(@Param('id') id: string, @Body() dto: ToggleActiveDto, @CurrentUser() u: JwtUser) {
    return this.users.toggleActive(id, dto.isActive, u);
  }

  @Patch('admin/users/workers/:id/password')
  @Roles('ADMIN')
  resetPassword(@Param('id') id: string, @Body() dto: ResetPasswordDto, @CurrentUser() u: JwtUser) {
    return this.users.resetPassword(id, dto.password, u);
  }

  @Patch('account')
  @Roles('ADMIN', 'WORKER')
  updateAccount(@Body() dto: UpdateAccountDto, @CurrentUser() u: JwtUser) {
    return this.users.updateAccount(u, dto.name, dto.email);
  }

  @Throttle({ default: { limit: 5, ttl: 600_000, blockDuration: 600_000 } })
  @Patch('account/password')
  @Roles('ADMIN', 'WORKER')
  changePassword(@Body() dto: ChangePasswordDto, @CurrentUser() u: JwtUser) {
    return this.users.changePassword(u, dto.currentPassword, dto.newPassword, dto.confirmPassword);
  }
}
