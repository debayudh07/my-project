import { IsOptional, IsString, IsBoolean, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryDoctorsDto {
  @ApiPropertyOptional({ 
    description: 'Filter doctors by medical specialization',
    example: 'Cardiology',
    enum: ['Cardiology', 'Dermatology', 'Pediatrics', 'Neurology', 'Orthopedics']
  })
  @IsOptional()
  @IsString()
  specialization?: string;

  @ApiPropertyOptional({ 
    description: 'Filter doctors by availability status',
    example: true,
    type: 'boolean'
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  available?: boolean;

  @ApiPropertyOptional({ 
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    default: 1
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiPropertyOptional({ 
    description: 'Number of items per page (maximum 100)',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;
}