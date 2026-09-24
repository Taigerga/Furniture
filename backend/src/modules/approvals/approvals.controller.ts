import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { JwtUser } from '../../common/decorators/current-user.decorator.js';
import { ApprovalsService } from './approvals.service.js';
import { ReviewDto, parseEntity } from './dto/review.dto.js';

@Controller('admin/approvals')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class ApprovalsController {
  constructor(private approvals: ApprovalsService) {}

  @Get()
  queue() {
    return this.approvals.queue();
  }

  @Get('pending-count')
  pendingCount() {
    return this.approvals.pendingCount();
  }

  @Patch(':entity/:id/approve')
  approve(@Param('entity') entity: string, @Param('id') id: string, @CurrentUser() u: JwtUser) {
    return this.approvals.approve(parseEntity(entity), id, u);
  }

  @Patch(':entity/:id/reject')
  reject(@Param('entity') entity: string, @Param('id') id: string, @Body() dto: ReviewDto, @CurrentUser() u: JwtUser) {
    return this.approvals.reject(parseEntity(entity), id, dto.reason, u);
  }
}
