import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class CategoryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(191)
  @Matches(SLUG_RE, { message: 'Slug hanya huruf kecil, angka, dan strip.' })
  slug!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}
