import { Module } from '@nestjs/common';
import { UploadModule } from '../upload/upload.module.js';
import { CompanyProfileController } from './company-profile.controller.js';
import { CompanyProfileService } from './company-profile.service.js';

@Module({
  imports: [UploadModule],
  controllers: [CompanyProfileController],
  providers: [CompanyProfileService],
})
export class CompanyProfileModule {}
