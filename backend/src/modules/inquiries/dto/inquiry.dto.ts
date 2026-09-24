import { IsEmail, IsIn, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateInquiryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(191)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(9)
  @MaxLength(30)
  @Matches(/^[0-9+()\-\s]+$/, { message: 'Nomor WhatsApp hanya angka dan + - ( ) spasi.' })
  whatsapp!: string;

  @IsInt()
  @Min(1)
  @Max(10000)
  quantity!: number;

  @IsString()
  @MinLength(5)
  @MaxLength(5000)
  message!: string;

  @IsOptional()
  @IsString()
  productId?: string;
}

export class UpdateInquiryStatusDto {
  @IsIn(['NEW', 'CONTACTED', 'PROCESSING', 'COMPLETED', 'CANCELLED'])
  status!: 'NEW' | 'CONTACTED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
}
