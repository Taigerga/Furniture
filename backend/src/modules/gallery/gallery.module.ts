import { Module } from '@nestjs/common';
import { ActivityService } from '../../common/utils/activity.service.js';
import { UploadModule } from '../upload/upload.module.js';
import { GalleryController } from './gallery.controller.js';
import { GalleryService } from './gallery.service.js';

@Module({
  imports: [UploadModule],
  controllers: [GalleryController],
  providers: [GalleryService, ActivityService],
})
export class GalleryModule {}
