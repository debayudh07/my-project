import { Doctor } from '../entities/doctor.entity';
import { ApiProperty } from '@nestjs/swagger';

export class DoctorResponseDto {
  @ApiProperty({ description: 'Unique identifier of the doctor', example: 1 })
  id: number;

  @ApiProperty({ description: 'Full name of the doctor', example: 'Dr. John Smith' })
  name: string;

  @ApiProperty({ description: 'Medical specialization', example: 'Cardiology' })
  specialization: string;

  @ApiProperty({ description: 'Email address', example: 'john.smith@hospital.com' })
  email: string;

  @ApiProperty({ description: 'Phone number', example: '+1-555-0101' })
  phone: string;

  @ApiProperty({ description: 'Years of medical experience', example: 15 })
  yearsOfExperience: number;

  @ApiProperty({ description: 'Consultation fee in USD', example: 150.00 })
  consultationFee: number;

  @ApiProperty({ description: 'Whether the doctor is currently available for appointments', example: true })
  isAvailable: boolean;

  constructor(doctor: Doctor) {
    this.id = doctor.id;
    this.name = doctor.name;
    this.specialization = doctor.specialization;
    this.email = doctor.email;
    this.phone = doctor.phone;
    this.yearsOfExperience = doctor.yearsOfExperience;
    this.consultationFee = doctor.consultationFee;
    this.isAvailable = doctor.isAvailable;
  }
}

export class DoctorDetailResponseDto extends DoctorResponseDto {
  @ApiProperty({ 
    description: 'Available time slots for the doctor',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        dayOfWeek: { type: 'number', description: 'Day of the week (1=Monday, 7=Sunday)', example: 1 },
        startTime: { type: 'string', description: 'Start time in HH:MM:SS format', example: '09:00:00' },
        endTime: { type: 'string', description: 'End time in HH:MM:SS format', example: '17:00:00' },
        slotDurationMinutes: { type: 'number', description: 'Duration of each appointment slot', example: 30 }
      }
    }
  })
  timeSlots: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    slotDurationMinutes: number;
  }[];

  constructor(doctor: Doctor) {
    super(doctor);
    this.timeSlots = doctor.timeSlots?.map(slot => ({
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      slotDurationMinutes: slot.slotDurationMinutes
    })) || [];
  }
}

export class PaginatedDoctorsResponseDto {
  @ApiProperty({ 
    description: 'Array of doctor objects',
    type: [DoctorResponseDto]
  })
  data: DoctorResponseDto[];

  @ApiProperty({ 
    description: 'Pagination metadata',
    type: 'object',
    properties: {
      total: { type: 'number', description: 'Total number of doctors', example: 25 },
      page: { type: 'number', description: 'Current page number', example: 1 },
      limit: { type: 'number', description: 'Items per page', example: 10 },
      totalPages: { type: 'number', description: 'Total number of pages', example: 3 }
    }
  })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  constructor(doctors: Doctor[], total: number, page: number, limit: number) {
    this.data = doctors.map(doctor => new DoctorResponseDto(doctor));
    this.meta = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
}