import { Module } from '@nestjs/common';
import { ActivityService } from '../../common/utils/activity.service.js';
import { UploadModule } from '../upload/upload.module.js';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';

@Module({
  imports: [UploadModule],
  controllers: [ProductsController],
  providers: [ProductsService, ActivityService],
  exports: [ProductsService],
})
export class ProductsModule {}
