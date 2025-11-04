import {
  IsNumber,
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsMongoId,
  IsEnum,
  IsBoolean,
  IsArray,
  Min,
} from 'class-validator';

export class CreateExpenseDto {
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsMongoId()
  @IsNotEmpty()
  family: string;

  @IsMongoId({ each: true })
  @IsOptional()
  child?: string[];

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  sharedWith?: string[];

  @IsEnum([
    'healthcare',
    'school',
    'activity',
    'clothing',
    'food',
    'transport',
    'entertainment',
    'other',
  ])
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  receipt?: string;
}
