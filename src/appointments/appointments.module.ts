import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { Appointment, AppointmentHistory, Doctor, DoctorTimeSlot } from '../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, AppointmentHistory, Doctor, DoctorTimeSlot])
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService]
})
export class AppointmentsModule {}