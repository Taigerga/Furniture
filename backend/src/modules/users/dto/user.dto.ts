import { IsBoolean, IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateWorkerDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password!: string;
}

export class ResetPasswordDto {
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password!: string;
}

export class ToggleActiveDto {
  @IsBoolean()
  isActive!: boolean;
}

export class UpdateAccountDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @IsEmail()
  email!: string;
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(1)
  currentPassword!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  newPassword!: string;

  @IsString()
  @MinLength(1)
  confirmPassword!: string;

  @IsOptional()
  @IsString()
  redirectTo?: string;
}
