import { Module } from '@nestjs/common';
import { UploadModule } from '../upload/upload.module.js';
import { PortfoliosController } from './portfolios.controller.js';
import { PortfoliosService } from './portfolios.service.js';

@Module({
  imports: [UploadModule],
  controllers: [PortfoliosController],
  providers: [PortfoliosService],
})
export class PortfoliosModule {}
