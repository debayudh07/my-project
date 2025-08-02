import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorsController } from './doctors.controller';
import { DoctorsService } from './doctors.service';
import { Doctor, DoctorTimeSlot, Appointment } from '../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Doctor, DoctorTimeSlot, Appointment])
  ],
  controllers: [DoctorsController],
  providers: [DoctorsService],
  exports: [DoctorsService]
})
export class DoctorsModule {}