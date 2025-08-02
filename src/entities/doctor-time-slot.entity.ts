import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique } from 'typeorm';
import { Doctor } from './doctor.entity';

@Entity('doctor_time_slots')
@Unique(['doctorId', 'dayOfWeek', 'startTime'])
export class DoctorTimeSlot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'doctor_id' })
  doctorId: number;

  @Column({ name: 'day_of_week', type: 'int' })
  dayOfWeek: number; // 0=Sunday, 6=Saturday

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @Column({ name: 'slot_duration_minutes', default: 30 })
  slotDurationMinutes: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Doctor, doctor => doctor.timeSlots, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;
}