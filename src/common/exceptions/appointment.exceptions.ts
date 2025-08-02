import { HttpException, HttpStatus } from '@nestjs/common';

export class AppointmentConflictException extends HttpException {
  constructor(doctorId: number, dateTime: string, conflictingAppointmentId?: number) {
    const message = `The selected time slot is already booked for doctor ${doctorId} at ${dateTime}`;
    super({
      error: {
        code: 'APPOINTMENT_CONFLICT',
        message,
        details: {
          doctorId,
          dateTime,
          conflictingAppointmentId
        },
        timestamp: new Date().toISOString()
      }
    }, HttpStatus.CONFLICT);
  }
}

export class AppointmentNotFoundException extends HttpException {
  constructor(appointmentId: number) {
    super({
      error: {
        code: 'APPOINTMENT_NOT_FOUND',
        message: `Appointment with ID ${appointmentId} not found`,
        details: { appointmentId },
        timestamp: new Date().toISOString()
      }
    }, HttpStatus.NOT_FOUND);
  }
}

export class InvalidTimeSlotException extends HttpException {
  constructor(message: string, details?: any) {
    super({
      error: {
        code: 'INVALID_TIME_SLOT',
        message,
        details,
        timestamp: new Date().toISOString()
      }
    }, HttpStatus.BAD_REQUEST);
  }
}

export class DoctorNotAvailableException extends HttpException {
  constructor(doctorId: number, dateTime: string) {
    super({
      error: {
        code: 'DOCTOR_NOT_AVAILABLE',
        message: `Doctor ${doctorId} is not available at ${dateTime}`,
        details: { doctorId, dateTime },
        timestamp: new Date().toISOString()
      }
    }, HttpStatus.BAD_REQUEST);
  }
}