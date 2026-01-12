import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsBoolean,
} from 'class-validator';

export class AdminUpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsDateString()
  @IsOptional()
  birthDate?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsDateString()
  @IsOptional()
  deletedAt: Date | null;

  @IsEnum(['parent', 'child', 'relative'])
  @IsOptional()
  role?: string;

  @IsBoolean()
  @IsOptional()
  isAdmin?: boolean;
}
