import { IsOptional, IsDateString, IsString, Matches, IsEnum, IsInt, Min, Max } from 'class-validator';
import { AppointmentStatus } from '../entities/appointment.entity';

export class UpdateAppointmentDto {
  @IsOptional()
  @IsDateString()
  appointmentDate?: string; // YYYY-MM-DD

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, { 
    message: 'Time must be in HH:MM:SS format' 
  })
  appointmentTime?: string; // HH:MM:SS

  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(180)
  durationMinutes?: number;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  changedBy?: string; // For audit trail

  @IsOptional()
  @IsString()
  changeReason?: string; // For audit trail
}