import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class GalleryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(191)
  title!: string;

  @IsString()
  @IsIn(['produk', 'workshop', 'kantor', 'proyek', 'kegiatan'])
  category!: string;

  /** URL gambar hasil upload via POST /upload (wajib saat create). */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  url?: string;
}
