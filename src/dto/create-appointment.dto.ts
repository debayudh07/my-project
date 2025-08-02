import { IsNotEmpty, IsString, IsInt, IsEmail, IsOptional, IsDateString, Matches, IsPositive, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({ 
    description: 'Unique identifier of the doctor',
    example: 1,
    type: 'number'
  })
  @IsInt()
  @IsPositive()
  @Transform(({ value }) => parseInt(value))
  doctorId: number;

  @ApiProperty({ 
    description: 'Full name of the patient',
    example: 'John Doe',
    minLength: 1,
    maxLength: 255
  })
  @IsNotEmpty()
  @IsString()
  patientName: string;

  @ApiProperty({ 
    description: 'Email address of the patient',
    example: 'john.doe@email.com',
    format: 'email'
  })
  @IsEmail()
  patientEmail: string;

  @ApiProperty({ 
    description: 'Phone number of the patient (international format supported)',
    example: '+1-555-1234',
    pattern: '^\\+?[\\d\\s\\-\\(\\)]+$'
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+?[\d\s\-\(\)]+$/, { message: 'Invalid phone number format' })
  patientPhone: string;

  @ApiProperty({ 
    description: 'Date of the appointment in YYYY-MM-DD format',
    example: '2024-01-15',
    format: 'date'
  })
  @IsDateString()
  appointmentDate: string; // YYYY-MM-DD

  @ApiProperty({ 
    description: 'Time of the appointment in HH:MM:SS format (24-hour)',
    example: '09:00:00',
    pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$'
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, { 
    message: 'Time must be in HH:MM:SS format' 
  })
  appointmentTime: string; // HH:MM:SS

  @ApiProperty({ 
    description: 'Duration of the appointment in minutes',
    example: 30,
    minimum: 15,
    maximum: 180,
    default: 30,
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(180)
  durationMinutes?: number = 30;

  @ApiProperty({ 
    description: 'Additional notes or comments about the appointment',
    example: 'Regular checkup - patient has been feeling well',
    required: false,
    maxLength: 1000
  })
  @IsOptional()
  @IsString()
  notes?: string;
}