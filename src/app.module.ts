import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DoctorsModule } from './doctors/doctors.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { Doctor, DoctorTimeSlot, Appointment, AppointmentHistory } from './entities';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgresql://doctor_appointments_bf3y_user:zLKNPOpfO2zlD59cDhUf8NenVhf9RRVg@dpg-d276boogjchc73fd6sb0-a.singapore-postgres.render.com:5432/doctor_appointments_bf3y',
      entities: [Doctor, DoctorTimeSlot, Appointment, AppointmentHistory],
      synchronize: true, // Enable for development - tables will be created automatically
      logging: true, // Enable logging to see what's happening
      ssl: {
        rejectUnauthorized: false,
      },
    }),
    DoctorsModule,
    AppointmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
