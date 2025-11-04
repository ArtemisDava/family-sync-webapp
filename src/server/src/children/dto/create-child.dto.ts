// server/src/children/dto/create-child.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsMongoId,
  IsHexColor,
  IsArray,
  IsBoolean,
} from 'class-validator';

export class CreateChildDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDateString()
  @IsNotEmpty()
  birthDate: string;

  @IsHexColor()
  @IsOptional()
  color?: string;

  @IsMongoId()
  @IsNotEmpty()
  family: string;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  guardians?: string[];

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
