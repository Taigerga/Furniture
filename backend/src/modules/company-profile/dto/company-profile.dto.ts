import { IsEmail, IsNumber, IsOptional, IsString, IsUrl, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CompanyProfileDto {
  @IsString()
  @MinLength(2)
  @MaxLength(191)
  name!: string;

  @IsOptional() @IsString() @MaxLength(255) tagline?: string;
  @IsOptional() @IsString() @MaxLength(20000) description?: string;
  @IsOptional() @IsString() @MaxLength(20000) history?: string;
  @IsOptional() @IsString() @MaxLength(5000) vision?: string;
  @IsOptional() @IsString() @MaxLength(5000) mission?: string;
  @IsOptional() @IsString() @MaxLength(30) phone?: string;
  @IsOptional() @IsString() @MaxLength(30) whatsapp?: string;
  @IsOptional() @IsString() @MaxLength(191) email?: string;
  @IsOptional() @IsString() @MaxLength(2000) address?: string;
  @IsOptional() @IsString() @MaxLength(500) mapsUrl?: string;
  @IsOptional() @IsString() @MaxLength(255) instagram?: string;
  @IsOptional() @IsString() @MaxLength(255) facebook?: string;
  @IsOptional() @IsString() @MaxLength(255) linkedin?: string;
  @IsOptional() @IsString() @MaxLength(191) hours?: string;
  @IsOptional() @IsString() @MaxLength(500) logoUrl?: string | null;
  @IsOptional() @IsString() @MaxLength(500) heroImageUrl?: string | null;
  @IsOptional() @IsNumber({}, { message: 'Latitude harus angka.' }) @Min(-90) @Max(90) latitude?: number | null;
  @IsOptional() @IsNumber({}, { message: 'Longitude harus angka.' }) @Min(-180) @Max(180) longitude?: number | null;
}
