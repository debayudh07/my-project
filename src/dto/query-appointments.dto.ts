import { IsOptional, IsString, IsInt, IsDateString, IsEmail, IsEnum, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { AppointmentStatus } from '../entities/appointment.entity';

export class QueryAppointmentsDto {
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  doctorId?: number;

  @IsOptional()
  @IsEmail()
  patientEmail?: string;

  @IsOptional()
  @IsDateString()
  date?: string; // YYYY-MM-DD

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;
}