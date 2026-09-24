import { Module } from '@nestjs/common';
import { ActivityService } from '../../common/utils/activity.service.js';
import { UploadModule } from '../upload/upload.module.js';
import { ApprovalsController } from './approvals.controller.js';
import { ApprovalsService } from './approvals.service.js';

@Module({
  imports: [UploadModule],
  controllers: [ApprovalsController],
  providers: [ApprovalsService, ActivityService],
})
export class ApprovalsModule {}
