import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsMongoId,
  IsEnum,
  IsBoolean,
  IsArray,
  IsNumber,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsMongoId()
  @IsNotEmpty()
  family: string;

  @IsMongoId()
  @IsOptional()
  child?: string;

  @IsMongoId()
  @IsOptional()
  adult?: string;

  @IsEnum(['shared', 'private'])
  @IsOptional()
  visibility?: string;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  sharedWith?: string[];

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @IsString()
  @IsOptional()
  recurrencePattern?: string;

  @IsDateString()
  @IsOptional()
  recurrenceEndDate?: string;

  @IsEnum(['appointment', 'school', 'activity', 'birthday', 'other'])
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  reminders?: number[];

  @IsString()
  @IsOptional()
  color?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  notes?: string[];

  @IsBoolean()
  @IsOptional()
  isAllDay?: boolean;
}
