import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
  IsDateString,
  IsBoolean,
} from 'class-validator';

export class AdminCreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDateString()
  @IsNotEmpty()
  birthDate: string;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsEnum(['parent', 'child', 'relative'])
  @IsOptional()
  role?: string;

  @IsBoolean()
  @IsOptional()
  isAdmin?: boolean;
}
