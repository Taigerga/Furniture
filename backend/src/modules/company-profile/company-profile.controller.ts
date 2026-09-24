import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { CompanyProfileService } from './company-profile.service.js';
import { CompanyProfileDto } from './dto/company-profile.dto.js';

@Controller()
export class CompanyProfileController {
  constructor(private company: CompanyProfileService) {}

  @Get('company-profile')
  getPublic() {
    return this.company.getPublic();
  }

  @Get('admin/company-profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminGet() {
    return this.company.adminGet();
  }

  @Patch('admin/company-profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  upsert(@Body() dto: CompanyProfileDto) {
    return this.company.upsert(dto);
  }
}
