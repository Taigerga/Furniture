import { IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class ArticleDto {
  @IsString()
  @MinLength(4)
  @MaxLength(191)
  title!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(191)
  @Matches(SLUG_RE, { message: 'Slug hanya huruf kecil, angka, dan strip.' })
  slug!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  @IsString()
  @MinLength(1, { message: 'Konten wajib diisi.' })
  content!: string;

  @IsOptional()
  @IsIn(['DRAFT', 'PUBLISHED'])
  status?: 'DRAFT' | 'PUBLISHED';

  /** URL thumbnail hasil upload via POST /upload (opsional). */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  thumbnail?: string;
}
