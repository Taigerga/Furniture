import { Module } from '@nestjs/common';
import { ActivityService } from '../../common/utils/activity.service.js';
import { UploadModule } from '../upload/upload.module.js';
import { ArticlesController } from './articles.controller.js';
import { ArticlesService } from './articles.service.js';

@Module({
  imports: [UploadModule],
  controllers: [ArticlesController],
  providers: [ArticlesService, ActivityService],
})
export class ArticlesModule {}
