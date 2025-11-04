import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsMongoId,
  IsBoolean,
} from 'class-validator';

export class CreateFamilyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  members?: string[];

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  children?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
