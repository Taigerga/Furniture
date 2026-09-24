import { Module } from '@nestjs/common';
import { ActivityService } from '../../common/utils/activity.service.js';
import { InquiriesController } from './inquiries.controller.js';
import { InquiriesService } from './inquiries.service.js';

@Module({
  controllers: [InquiriesController],
  providers: [InquiriesService, ActivityService],
})
export class InquiriesModule {}
