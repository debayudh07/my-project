import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Appointment, AppointmentStatus } from './appointment.entity';

@Entity('appointment_history')
export class AppointmentHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'appointment_id' })
  appointmentId: number;

  @Column({ 
    name: 'previous_status', 
    type: 'varchar', 
    length: 50,
    nullable: true 
  })
  previousStatus: AppointmentStatus | null;

  @Column({ 
    name: 'new_status', 
    type: 'varchar', 
    length: 50 
  })
  newStatus: AppointmentStatus;

  @Column({ name: 'changed_by', length: 255, nullable: true })
  changedBy: string;

  @Column({ name: 'change_reason', type: 'text', nullable: true })
  changeReason: string;

  @CreateDateColumn({ name: 'changed_at', type: 'timestamp with time zone' })
  changedAt: Date;

  // Relations
  @ManyToOne(() => Appointment, appointment => appointment.history, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;
}