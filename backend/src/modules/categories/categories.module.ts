import { Module } from '@nestjs/common';
import { ActivityService } from '../../common/utils/activity.service.js';
import { CategoriesController } from './categories.controller.js';
import { CategoriesService } from './categories.service.js';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, ActivityService],
})
export class CategoriesModule {}
