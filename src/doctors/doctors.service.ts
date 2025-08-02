import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor, DoctorTimeSlot, Appointment, AppointmentStatus } from '../entities';
import { 
  QueryDoctorsDto, 
  DoctorResponseDto, 
  DoctorDetailResponseDto, 
  PaginatedDoctorsResponseDto,
  QueryAvailableSlotsDto,
  AvailableSlotResponseDto,
  AvailableSlotsResponseDto
} from '../dto';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private doctorsRepository: Repository<Doctor>,
    @InjectRepository(DoctorTimeSlot)
    private timeSlotsRepository: Repository<DoctorTimeSlot>,
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
  ) {}

  async findAll(queryDto: QueryDoctorsDto): Promise<PaginatedDoctorsResponseDto> {
    const { specialization, available, page = 1, limit = 10 } = queryDto;
    
    const queryBuilder = this.doctorsRepository.createQueryBuilder('doctor');
    
    if (specialization) {
      queryBuilder.andWhere('doctor.specialization ILIKE :specialization', { 
        specialization: `%${specialization}%` 
      });
    }
    
    if (available !== undefined) {
      queryBuilder.andWhere('doctor.isAvailable = :available', { available });
    }

    const total = await queryBuilder.getCount();
    
    const doctors = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return new PaginatedDoctorsResponseDto(doctors, total, page, limit);
  }

  async findOne(id: number): Promise<DoctorDetailResponseDto> {
    const doctor = await this.doctorsRepository.findOne({
      where: { id },
      relations: ['timeSlots']
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }

    return new DoctorDetailResponseDto(doctor);
  }

  async getAvailableSlots(
    doctorId: number, 
    queryDto: QueryAvailableSlotsDto
  ): Promise<AvailableSlotsResponseDto> {
    const { date, duration = 30 } = queryDto;

    // Check if doctor exists
    const doctor = await this.doctorsRepository.findOne({ where: { id: doctorId } });
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${doctorId} not found`);
    }

    // Get day of week (0=Sunday, 6=Saturday)
    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.getDay();

    // Get doctor's time slots for this day
    const timeSlots = await this.timeSlotsRepository.find({
      where: { 
        doctorId, 
        dayOfWeek,
        isActive: true 
      }
    });

    if (timeSlots.length === 0) {
      return new AvailableSlotsResponseDto(doctorId, date, []);
    }

    // Get existing appointments for this date
    const existingAppointments = await this.appointmentsRepository.find({
      where: { 
        doctorId, 
        appointmentDate: date,
        status: AppointmentStatus.SCHEDULED // Only consider scheduled appointments
      }
    });

    const availableSlots: AvailableSlotResponseDto[] = [];

    for (const timeSlot of timeSlots) {
      const slots = this.generateTimeSlots(
        timeSlot.startTime, 
        timeSlot.endTime, 
        duration
      );

      for (const slot of slots) {
        const isAvailable = !this.isSlotConflicting(
          slot.startTime, 
          slot.endTime, 
          existingAppointments
        );
        
        availableSlots.push(new AvailableSlotResponseDto(
          slot.startTime, 
          slot.endTime, 
          isAvailable
        ));
      }
    }

    return new AvailableSlotsResponseDto(doctorId, date, availableSlots);
  }

  private generateTimeSlots(startTime: string, endTime: string, duration: number): { startTime: string, endTime: string }[] {
    const slots: { startTime: string, endTime: string }[] = [];
    const start = this.timeStringToMinutes(startTime);
    const end = this.timeStringToMinutes(endTime);

    for (let current = start; current + duration <= end; current += duration) {
      const slotStart = this.minutesToTimeString(current);
      const slotEnd = this.minutesToTimeString(current + duration);
      slots.push({ startTime: slotStart, endTime: slotEnd });
    }

    return slots;
  }

  private timeStringToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private minutesToTimeString(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
  }

  private isSlotConflicting(
    slotStart: string, 
    slotEnd: string, 
    appointments: Appointment[]
  ): boolean {
    const slotStartMinutes = this.timeStringToMinutes(slotStart);
    const slotEndMinutes = this.timeStringToMinutes(slotEnd);

    return appointments.some(appointment => {
      const appointmentStartMinutes = this.timeStringToMinutes(appointment.appointmentTime);
      const appointmentEndMinutes = this.timeStringToMinutes(appointment.endTime);

      // Check for overlap: slot overlaps with appointment if it starts before appointment ends 
      // and ends after appointment starts
      return slotStartMinutes < appointmentEndMinutes && slotEndMinutes > appointmentStartMinutes;
    });
  }
}