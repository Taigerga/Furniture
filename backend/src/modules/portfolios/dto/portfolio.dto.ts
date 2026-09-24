import { IsArray, IsBoolean, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength } from 'class-validator';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class PortfolioDto {
  @IsString()
  @MinLength(2)
  @MaxLength(191)
  title!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(191)
  @Matches(SLUG_RE, { message: 'Slug hanya huruf kecil, angka, dan strip.' })
  slug!: string;

  @IsOptional()
  @IsString()
  @MaxLength(191)
  client?: string;

  @IsOptional()
  @IsString()
  @MaxLength(191)
  location?: string;

  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  year?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20000)
  description?: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];
}

export class AddPortfolioImagesDto {
  @IsArray()
  @IsString({ each: true })
  urls!: string[];
}
