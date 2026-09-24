import {
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class ProductDto {
  @IsString()
  @MinLength(2)
  @MaxLength(191)
  name!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(191)
  @Matches(SLUG_RE, { message: 'Slug hanya huruf kecil, angka, dan strip.' })
  slug!: string;

  @IsString()
  @MinLength(1, { message: 'Kategori wajib dipilih.' })
  categoryId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  shortDesc?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(191)
  material?: string;

  @IsOptional()
  @IsString()
  @MaxLength(191)
  dimensions?: string;

  @IsOptional()
  @IsString()
  @MaxLength(191)
  color?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20000)
  specifications?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'DRAFT', 'ARCHIVED'])
  status?: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  /** URL gambar hasil upload via POST /upload/many (maks 8). */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];
}

export class AddImagesDto {
  @IsArray()
  @IsString({ each: true })
  urls!: string[];
}
