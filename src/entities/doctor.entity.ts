import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { DoctorTimeSlot } from './doctor-time-slot.entity';
import { Appointment } from './appointment.entity';

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255 })
  specialization: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 20 })
  phone: string;

  @Column({ name: 'years_of_experience', default: 0 })
  yearsOfExperience: number;

  @Column({ name: 'consultation_fee', type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  consultationFee: number;

  @Column({ name: 'is_available', default: true })
  isAvailable: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => DoctorTimeSlot, timeSlot => timeSlot.doctor, { cascade: true })
  timeSlots: DoctorTimeSlot[];

  @OneToMany(() => Appointment, appointment => appointment.doctor)
  appointments: Appointment[];
}