import { IsNotEmpty, IsDateString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryAvailableSlotsDto {
  @IsNotEmpty()
  @IsDateString()
  date: string; // YYYY-MM-DD - Required

  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(180)
  @Transform(({ value }) => parseInt(value))
  duration?: number = 30; // Duration in minutes
}