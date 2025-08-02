import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Unique, OneToMany } from 'typeorm';
import { Doctor } from './doctor.entity';
import { AppointmentHistory } from './appointment-history.entity';

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed', 
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}

@Entity('appointments')
@Unique(['doctorId', 'appointmentDate', 'appointmentTime'])
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'doctor_id' })
  doctorId: number;

  @Column({ name: 'patient_name', length: 255 })
  patientName: string;

  @Column({ name: 'patient_email', length: 255 })
  patientEmail: string;

  @Column({ name: 'patient_phone', length: 20 })
  patientPhone: string;

  @Column({ name: 'appointment_date', type: 'date' })
  appointmentDate: string; // Format: YYYY-MM-DD

  @Column({ name: 'appointment_time', type: 'time' })
  appointmentTime: string; // Format: HH:MM:SS

  @Column({ name: 'end_time', type: 'time' })
  endTime: string; // Format: HH:MM:SS

  @Column({ 
    type: 'varchar', 
    length: 50, 
    default: AppointmentStatus.SCHEDULED 
  })
  status: AppointmentStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Doctor, doctor => doctor.appointments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @OneToMany(() => AppointmentHistory, history => history.appointment, { cascade: true })
  history: AppointmentHistory[];
}