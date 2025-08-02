// Request DTOs
export { CreateAppointmentDto } from './create-appointment.dto';
export { UpdateAppointmentDto } from './update-appointment.dto';
export { QueryDoctorsDto } from './query-doctors.dto';
export { QueryAppointmentsDto } from './query-appointments.dto';
export { QueryAvailableSlotsDto } from './query-available-slots.dto';

// Response DTOs
export { DoctorResponseDto, DoctorDetailResponseDto, PaginatedDoctorsResponseDto } from './doctor-response.dto';
export { 
  AppointmentResponseDto, 
  AppointmentDetailResponseDto, 
  PaginatedAppointmentsResponseDto,
  AvailableSlotResponseDto,
  AvailableSlotsResponseDto 
} from './appointment-response.dto';