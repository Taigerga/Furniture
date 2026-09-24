import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { UploadService } from './upload.service.js';

const multerOpts = {
  storage: memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 10 },
};

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private upload: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', multerOpts))
  async uploadOne(@UploadedFile() file: Express.Multer.File, @Query('prefix') prefix?: string) {
    if (!file) throw new BadRequestException('Pilih satu file.');
    const url = await this.upload.save(file, prefix || 'upload');
    return { url };
  }

  @Post('many')
  @UseInterceptors(FilesInterceptor('files', 10, multerOpts))
  async uploadMany(
    @UploadedFiles() files: Express.Multer.File[],
    @Query('prefix') prefix?: string,
    @Query('max') max?: string,
  ) {
    if (!files || files.length === 0) throw new BadRequestException('Pilih minimal satu file.');
    const urls = await this.upload.saveMany(files, prefix || 'upload', Number(max) || 10);
    return { urls };
  }
}
