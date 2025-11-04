import { IsISO8601, IsOptional, IsMongoId } from 'class-validator';

export class DateRangeQueryDto {
  @IsISO8601()
  startDate: string;

  @IsISO8601()
  endDate: string;

  @IsOptional()
  @IsMongoId()
  familyId?: string;

  @IsOptional()
  @IsMongoId()
  userId?: string;
}
