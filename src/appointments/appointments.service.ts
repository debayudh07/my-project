import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { 
  Appointment, 
  AppointmentHistory, 
  AppointmentStatus, 
  Doctor, 
  DoctorTimeSlot 
} from '../entities';
import { 
  CreateAppointmentDto, 
  UpdateAppointmentDto, 
  QueryAppointmentsDto,
  AppointmentResponseDto,
  AppointmentDetailResponseDto,
  PaginatedAppointmentsResponseDto
} from '../dto';
import { 
  AppointmentConflictException,
  AppointmentNotFoundException,
  InvalidTimeSlotException,
  DoctorNotAvailableException
} from '../common/exceptions/appointment.exceptions';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
    @InjectRepository(AppointmentHistory)
    private historyRepository: Repository<AppointmentHistory>,
    @InjectRepository(Doctor)
    private doctorsRepository: Repository<Doctor>,
    @InjectRepository(DoctorTimeSlot)
    private timeSlotsRepository: Repository<DoctorTimeSlot>,
    private dataSource: DataSource,
  ) {}

  async create(createDto: CreateAppointmentDto): Promise<AppointmentResponseDto> {
    const { 
      doctorId, 
      patientName, 
      patientEmail, 
      patientPhone, 
      appointmentDate, 
      appointmentTime, 
      durationMinutes = 30, 
      notes 
    } = createDto;

    // Calculate end time
    const endTime = this.calculateEndTime(appointmentTime, durationMinutes);

    // Use transaction to ensure data consistency
    return this.dataSource.transaction(async manager => {
      // 1. Validate doctor exists and is available
      const doctor = await manager.findOne(Doctor, { 
        where: { id: doctorId, isAvailable: true } 
      });
      
      if (!doctor) {
        throw new DoctorNotAvailableException(doctorId, `${appointmentDate} ${appointmentTime}`);
      }

      // 2. Validate appointment is in the future
      const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
      if (appointmentDateTime <= new Date()) {
        throw new InvalidTimeSlotException('Cannot book appointments in the past');
      }

      // 3. Validate appointment is within doctor's working hours
      await this.validateWorkingHours(doctorId, appointmentDate, appointmentTime, endTime, manager);

      // 4. Check for conflicts (CRITICAL: Prevent double-booking)
      await this.checkForConflicts(doctorId, appointmentDate, appointmentTime, endTime, manager);

      // 5. Create the appointment
      const appointment = manager.create(Appointment, {
        doctorId,
        patientName,
        patientEmail,
        patientPhone,
        appointmentDate,
        appointmentTime,
        endTime,
        status: AppointmentStatus.SCHEDULED,
        notes
      });

      const savedAppointment = await manager.save(Appointment, appointment);

      // 6. Create history record
      await manager.save(AppointmentHistory, {
        appointmentId: savedAppointment.id,
        previousStatus: null,
        newStatus: AppointmentStatus.SCHEDULED,
        changedBy: 'system',
        changeReason: 'Initial booking'
      });

      return new AppointmentResponseDto(savedAppointment);
    });
  }

  async findAll(queryDto: QueryAppointmentsDto): Promise<PaginatedAppointmentsResponseDto> {
    const { doctorId, patientEmail, date, status, page = 1, limit = 10 } = queryDto;
    
    const queryBuilder = this.appointmentsRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.doctor', 'doctor');
    
    if (doctorId) {
      queryBuilder.andWhere('appointment.doctorId = :doctorId', { doctorId });
    }
    
    if (patientEmail) {
      queryBuilder.andWhere('appointment.patientEmail = :patientEmail', { patientEmail });
    }
    
    if (date) {
      queryBuilder.andWhere('appointment.appointmentDate = :date', { date });
    }
    
    if (status) {
      queryBuilder.andWhere('appointment.status = :status', { status });
    }

    const total = await queryBuilder.getCount();
    
    const appointments = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('appointment.appointmentDate', 'ASC')
      .addOrderBy('appointment.appointmentTime', 'ASC')
      .getMany();

    return new PaginatedAppointmentsResponseDto(appointments, total, page, limit);
  }

  async findOne(id: number): Promise<AppointmentDetailResponseDto> {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id },
      relations: ['doctor']
    });

    if (!appointment) {
      throw new AppointmentNotFoundException(id);
    }

    return new AppointmentDetailResponseDto(appointment);
  }

  async update(id: number, updateDto: UpdateAppointmentDto): Promise<AppointmentResponseDto> {
    const { 
      appointmentDate, 
      appointmentTime, 
      durationMinutes, 
      status, 
      notes, 
      changedBy = 'user', 
      changeReason 
    } = updateDto;

    return this.dataSource.transaction(async manager => {
      const appointment = await manager.findOne(Appointment, { where: { id } });
      
      if (!appointment) {
        throw new AppointmentNotFoundException(id);
      }

      const previousStatus = appointment.status;
      let newEndTime = appointment.endTime;

      // If rescheduling, validate new time slot
      if (appointmentDate || appointmentTime || durationMinutes) {
        const newDate = appointmentDate || appointment.appointmentDate;
        const newTime = appointmentTime || appointment.appointmentTime;
        const newDuration = durationMinutes || this.calculateDuration(appointment.appointmentTime, appointment.endTime);
        
        newEndTime = this.calculateEndTime(newTime, newDuration);

        // Validate new time slot
        await this.validateWorkingHours(appointment.doctorId, newDate, newTime, newEndTime, manager);
        await this.checkForConflicts(appointment.doctorId, newDate, newTime, newEndTime, manager, id);
      }

      // Update appointment
      const updatedAppointment = await manager.save(Appointment, {
        ...appointment,
        ...(appointmentDate && { appointmentDate }),
        ...(appointmentTime && { appointmentTime }),
        ...(newEndTime !== appointment.endTime && { endTime: newEndTime }),
        ...(status && { status }),
        ...(notes && { notes })
      });

      // Create history record if status changed
      if (status && status !== previousStatus) {
        await manager.save(AppointmentHistory, {
          appointmentId: id,
          previousStatus,
          newStatus: status,
          changedBy,
          changeReason
        });
      }

      return new AppointmentResponseDto(updatedAppointment);
    });
  }

  async remove(id: number): Promise<{ message: string; data: any }> {
    return this.dataSource.transaction(async manager => {
      const appointment = await manager.findOne(Appointment, { where: { id } });
      
      if (!appointment) {
        throw new AppointmentNotFoundException(id);
      }

      // Update status to cancelled instead of deleting
      const cancelledAppointment = await manager.save(Appointment, {
        ...appointment,
        status: AppointmentStatus.CANCELLED
      });

      // Create history record
      await manager.save(AppointmentHistory, {
        appointmentId: id,
        previousStatus: appointment.status,
        newStatus: AppointmentStatus.CANCELLED,
        changedBy: 'user',
        changeReason: 'Appointment cancelled'
      });

      return {
        message: 'Appointment cancelled successfully',
        data: {
          id: cancelledAppointment.id,
          status: cancelledAppointment.status,
          cancelledAt: new Date().toISOString()
        }
      };
    });
  }

  // CRITICAL: Conflict detection to prevent double-booking
  private async checkForConflicts(
    doctorId: number, 
    date: string, 
    startTime: string, 
    endTime: string, 
    manager: any,
    excludeAppointmentId?: number
  ): Promise<void> {
    const conflictQuery = manager
      .createQueryBuilder(Appointment, 'appointment')
      .where('appointment.doctorId = :doctorId', { doctorId })
      .andWhere('appointment.appointmentDate = :date', { date })
      .andWhere('appointment.status != :cancelled', { cancelled: AppointmentStatus.CANCELLED })
      .andWhere(
        '(appointment.appointmentTime < :endTime AND appointment.endTime > :startTime)',
        { startTime, endTime }
      );

    if (excludeAppointmentId) {
      conflictQuery.andWhere('appointment.id != :excludeId', { excludeId: excludeAppointmentId });
    }

    const conflictingAppointment = await conflictQuery.getOne();

    if (conflictingAppointment) {
      throw new AppointmentConflictException(
        doctorId, 
        `${date} ${startTime}-${endTime}`, 
        conflictingAppointment.id
      );
    }
  }

  private async validateWorkingHours(
    doctorId: number, 
    date: string, 
    startTime: string, 
    endTime: string, 
    manager: any
  ): Promise<void> {
    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.getDay();

    const timeSlot = await manager.findOne(DoctorTimeSlot, {
      where: { 
        doctorId, 
        dayOfWeek,
        isActive: true 
      }
    });

    if (!timeSlot) {
      throw new InvalidTimeSlotException(
        `Doctor is not available on this day of the week`,
        { doctorId, dayOfWeek, date }
      );
    }

    const startMinutes = this.timeStringToMinutes(startTime);
    const endMinutes = this.timeStringToMinutes(endTime);
    const slotStartMinutes = this.timeStringToMinutes(timeSlot.startTime);
    const slotEndMinutes = this.timeStringToMinutes(timeSlot.endTime);

    if (startMinutes < slotStartMinutes || endMinutes > slotEndMinutes) {
      throw new InvalidTimeSlotException(
        `Appointment time is outside doctor's working hours (${timeSlot.startTime} - ${timeSlot.endTime})`,
        { 
          doctorId, 
          requestedTime: `${startTime} - ${endTime}`,
          workingHours: `${timeSlot.startTime} - ${timeSlot.endTime}`
        }
      );
    }
  }

  private calculateEndTime(startTime: string, durationMinutes: number): string {
    const startMinutes = this.timeStringToMinutes(startTime);
    const endMinutes = startMinutes + durationMinutes;
    return this.minutesToTimeString(endMinutes);
  }

  private calculateDuration(startTime: string, endTime: string): number {
    const startMinutes = this.timeStringToMinutes(startTime);
    const endMinutes = this.timeStringToMinutes(endTime);
    return endMinutes - startMinutes;
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
}