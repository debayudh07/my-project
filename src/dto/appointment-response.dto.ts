import { Appointment, AppointmentStatus } from '../entities/appointment.entity';

export class AppointmentResponseDto {
  id: number;
  doctorId: number;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes: string;
  createdAt: Date;

  constructor(appointment: Appointment) {
    this.id = appointment.id;
    this.doctorId = appointment.doctorId;
    this.patientName = appointment.patientName;
    this.patientEmail = appointment.patientEmail;
    this.patientPhone = appointment.patientPhone;
    this.appointmentDate = appointment.appointmentDate;
    this.appointmentTime = appointment.appointmentTime;
    this.endTime = appointment.endTime;
    this.status = appointment.status;
    this.notes = appointment.notes;
    this.createdAt = appointment.createdAt;
  }
}

export class AppointmentDetailResponseDto extends AppointmentResponseDto {
  doctor: {
    id: number;
    name: string;
    specialization: string;
    consultationFee: number;
  };

  constructor(appointment: Appointment) {
    super(appointment);
    this.doctor = {
      id: appointment.doctor.id,
      name: appointment.doctor.name,
      specialization: appointment.doctor.specialization,
      consultationFee: appointment.doctor.consultationFee
    };
  }
}

export class PaginatedAppointmentsResponseDto {
  data: AppointmentResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  constructor(appointments: Appointment[], total: number, page: number, limit: number) {
    this.data = appointments.map(appointment => new AppointmentResponseDto(appointment));
    this.meta = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
}

export class AvailableSlotResponseDto {
  startTime: string;
  endTime: string;
  available: boolean;

  constructor(startTime: string, endTime: string, available: boolean = true) {
    this.startTime = startTime;
    this.endTime = endTime;
    this.available = available;
  }
}

export class AvailableSlotsResponseDto {
  doctorId: number;
  date: string;
  availableSlots: AvailableSlotResponseDto[];

  constructor(doctorId: number, date: string, slots: AvailableSlotResponseDto[]) {
    this.doctorId = doctorId;
    this.date = date;
    this.availableSlots = slots;
  }
}