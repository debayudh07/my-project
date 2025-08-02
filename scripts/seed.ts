import { DataSource } from 'typeorm';
import { Doctor } from '../src/entities/doctor.entity';
import { DoctorTimeSlot } from '../src/entities/doctor-time-slot.entity';
import { Appointment, AppointmentStatus } from '../src/entities/appointment.entity';

// Database configuration for seeding (supports both local and hosted databases)
const createDataSource = () => {
  // If DATABASE_URL is provided (typical for hosted databases like Render)
  if (process.env.DATABASE_URL) {
    return new DataSource({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Doctor, DoctorTimeSlot, Appointment],
      synchronize: false, // Don't auto-sync in production
      logging: true,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
  }
  
  // Fallback to individual connection parameters (for local development)
  return new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'doctor_appointments',
    entities: [Doctor, DoctorTimeSlot, Appointment],
    synchronize: false, // Don't auto-sync in production
    logging: true,
  });
};

const dataSource = createDataSource();

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Log connection type for debugging
    if (process.env.DATABASE_URL) {
      console.log('🔗 Connecting to hosted database (using DATABASE_URL)');
      // Hide password from logs for security
      const maskedUrl = process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':****@');
      console.log(`📍 Database URL: ${maskedUrl}`);
    } else {
      console.log('🏠 Connecting to local database (using individual parameters)');
      console.log(`📍 Host: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}`);
    }
    
    await dataSource.initialize();
    console.log('✅ Database connection established');

    // Clear existing data (optional - be careful in production!)
    const clearData = process.argv.includes('--clear');
    if (clearData) {
      console.log('🧹 Clearing existing data...');
      await dataSource.getRepository(Appointment).delete({});
      await dataSource.getRepository(DoctorTimeSlot).delete({});
      await dataSource.getRepository(Doctor).delete({});
      console.log('✅ Existing data cleared');
    }

    // Seed doctors
    console.log('👨‍⚕️ Seeding doctors...');
    const doctorRepository = dataSource.getRepository(Doctor);
    
    const doctorsData = [
      {
        name: 'Dr. John Smith',
        specialization: 'Cardiology',
        email: 'john.smith@hospital.com',
        phone: '+1-555-0101',
        yearsOfExperience: 15,
        consultationFee: 150.00,
        isAvailable: true,
      },
      {
        name: 'Dr. Sarah Johnson',
        specialization: 'Dermatology',
        email: 'sarah.johnson@hospital.com',
        phone: '+1-555-0102',
        yearsOfExperience: 8,
        consultationFee: 120.00,
        isAvailable: true,
      },
      {
        name: 'Dr. Michael Brown',
        specialization: 'Pediatrics',
        email: 'michael.brown@hospital.com',
        phone: '+1-555-0103',
        yearsOfExperience: 12,
        consultationFee: 100.00,
        isAvailable: true,
      },
      {
        name: 'Dr. Emily Davis',
        specialization: 'Neurology',
        email: 'emily.davis@hospital.com',
        phone: '+1-555-0104',
        yearsOfExperience: 10,
        consultationFee: 180.00,
        isAvailable: true,
      },
      {
        name: 'Dr. Robert Wilson',
        specialization: 'Orthopedics',
        email: 'robert.wilson@hospital.com',
        phone: '+1-555-0105',
        yearsOfExperience: 20,
        consultationFee: 160.00,
        isAvailable: true,
      },
      {
        name: 'Dr. Lisa Rodriguez',
        specialization: 'Psychiatry',
        email: 'lisa.rodriguez@hospital.com',
        phone: '+1-555-0106',
        yearsOfExperience: 7,
        consultationFee: 140.00,
        isAvailable: true,
      },
      {
        name: 'Dr. David Kim',
        specialization: 'Ophthalmology',
        email: 'david.kim@hospital.com',
        phone: '+1-555-0107',
        yearsOfExperience: 14,
        consultationFee: 130.00,
        isAvailable: false, // Some doctors might be unavailable
      },
    ];

    const doctors: Doctor[] = [];
    for (const doctorData of doctorsData) {
      const existingDoctor = await doctorRepository.findOneBy({ email: doctorData.email });
      if (!existingDoctor) {
        const doctor = doctorRepository.create(doctorData);
        const savedDoctor = await doctorRepository.save(doctor);
        doctors.push(savedDoctor);
        console.log(`  ✅ Created ${doctorData.name}`);
      } else {
        doctors.push(existingDoctor);
        console.log(`  ⏭️  ${doctorData.name} already exists`);
      }
    }

    // Seed time slots
    console.log('🕒 Seeding doctor time slots...');
    const timeSlotRepository = dataSource.getRepository(DoctorTimeSlot);
    
    const timeSlotsData = [
      // Dr. John Smith (Cardiology) - Monday to Friday, 9 AM to 5 PM
      { doctorId: doctors[0]?.id, dayOfWeek: 1, startTime: '09:00:00', endTime: '17:00:00', slotDurationMinutes: 30 },
      { doctorId: doctors[0]?.id, dayOfWeek: 2, startTime: '09:00:00', endTime: '17:00:00', slotDurationMinutes: 30 },
      { doctorId: doctors[0]?.id, dayOfWeek: 3, startTime: '09:00:00', endTime: '17:00:00', slotDurationMinutes: 30 },
      { doctorId: doctors[0]?.id, dayOfWeek: 4, startTime: '09:00:00', endTime: '17:00:00', slotDurationMinutes: 30 },
      { doctorId: doctors[0]?.id, dayOfWeek: 5, startTime: '09:00:00', endTime: '17:00:00', slotDurationMinutes: 30 },

      // Dr. Sarah Johnson (Dermatology) - Monday to Friday, 10 AM to 6 PM
      { doctorId: doctors[1]?.id, dayOfWeek: 1, startTime: '10:00:00', endTime: '18:00:00', slotDurationMinutes: 30 },
      { doctorId: doctors[1]?.id, dayOfWeek: 2, startTime: '10:00:00', endTime: '18:00:00', slotDurationMinutes: 30 },
      { doctorId: doctors[1]?.id, dayOfWeek: 3, startTime: '10:00:00', endTime: '18:00:00', slotDurationMinutes: 30 },
      { doctorId: doctors[1]?.id, dayOfWeek: 4, startTime: '10:00:00', endTime: '18:00:00', slotDurationMinutes: 30 },
      { doctorId: doctors[1]?.id, dayOfWeek: 5, startTime: '10:00:00', endTime: '18:00:00', slotDurationMinutes: 30 },

      // Dr. Michael Brown (Pediatrics) - Monday to Saturday, 8 AM to 4 PM
      { doctorId: doctors[2]?.id, dayOfWeek: 1, startTime: '08:00:00', endTime: '16:00:00', slotDurationMinutes: 20 },
      { doctorId: doctors[2]?.id, dayOfWeek: 2, startTime: '08:00:00', endTime: '16:00:00', slotDurationMinutes: 20 },
      { doctorId: doctors[2]?.id, dayOfWeek: 3, startTime: '08:00:00', endTime: '16:00:00', slotDurationMinutes: 20 },
      { doctorId: doctors[2]?.id, dayOfWeek: 4, startTime: '08:00:00', endTime: '16:00:00', slotDurationMinutes: 20 },
      { doctorId: doctors[2]?.id, dayOfWeek: 5, startTime: '08:00:00', endTime: '16:00:00', slotDurationMinutes: 20 },
      { doctorId: doctors[2]?.id, dayOfWeek: 6, startTime: '09:00:00', endTime: '13:00:00', slotDurationMinutes: 20 },

      // Dr. Emily Davis (Neurology) - Monday to Friday, 11 AM to 7 PM
      { doctorId: doctors[3]?.id, dayOfWeek: 1, startTime: '11:00:00', endTime: '19:00:00', slotDurationMinutes: 45 },
      { doctorId: doctors[3]?.id, dayOfWeek: 2, startTime: '11:00:00', endTime: '19:00:00', slotDurationMinutes: 45 },
      { doctorId: doctors[3]?.id, dayOfWeek: 3, startTime: '11:00:00', endTime: '19:00:00', slotDurationMinutes: 45 },
      { doctorId: doctors[3]?.id, dayOfWeek: 4, startTime: '11:00:00', endTime: '19:00:00', slotDurationMinutes: 45 },
      { doctorId: doctors[3]?.id, dayOfWeek: 5, startTime: '11:00:00', endTime: '19:00:00', slotDurationMinutes: 45 },

      // Dr. Robert Wilson (Orthopedics) - Monday to Friday, 7 AM to 3 PM
      { doctorId: doctors[4]?.id, dayOfWeek: 1, startTime: '07:00:00', endTime: '15:00:00', slotDurationMinutes: 60 },
      { doctorId: doctors[4]?.id, dayOfWeek: 2, startTime: '07:00:00', endTime: '15:00:00', slotDurationMinutes: 60 },
      { doctorId: doctors[4]?.id, dayOfWeek: 3, startTime: '07:00:00', endTime: '15:00:00', slotDurationMinutes: 60 },
      { doctorId: doctors[4]?.id, dayOfWeek: 4, startTime: '07:00:00', endTime: '15:00:00', slotDurationMinutes: 60 },
      { doctorId: doctors[4]?.id, dayOfWeek: 5, startTime: '07:00:00', endTime: '15:00:00', slotDurationMinutes: 60 },

      // Dr. Lisa Rodriguez (Psychiatry) - Monday to Friday, 12 PM to 8 PM
      { doctorId: doctors[5]?.id, dayOfWeek: 1, startTime: '12:00:00', endTime: '20:00:00', slotDurationMinutes: 50 },
      { doctorId: doctors[5]?.id, dayOfWeek: 2, startTime: '12:00:00', endTime: '20:00:00', slotDurationMinutes: 50 },
      { doctorId: doctors[5]?.id, dayOfWeek: 3, startTime: '12:00:00', endTime: '20:00:00', slotDurationMinutes: 50 },
      { doctorId: doctors[5]?.id, dayOfWeek: 4, startTime: '12:00:00', endTime: '20:00:00', slotDurationMinutes: 50 },
      { doctorId: doctors[5]?.id, dayOfWeek: 5, startTime: '12:00:00', endTime: '20:00:00', slotDurationMinutes: 50 },

      // Dr. David Kim (Ophthalmology) - Currently unavailable, limited schedule
      { doctorId: doctors[6]?.id, dayOfWeek: 2, startTime: '14:00:00', endTime: '17:00:00', slotDurationMinutes: 25 },
      { doctorId: doctors[6]?.id, dayOfWeek: 4, startTime: '14:00:00', endTime: '17:00:00', slotDurationMinutes: 25 },
    ];

    for (const slotData of timeSlotsData) {
      if (slotData.doctorId) {
        const existingSlot = await timeSlotRepository.findOneBy({
          doctorId: slotData.doctorId,
          dayOfWeek: slotData.dayOfWeek,
          startTime: slotData.startTime,
        });

        if (!existingSlot) {
          const timeSlot = timeSlotRepository.create(slotData);
          await timeSlotRepository.save(timeSlot);
          console.log(`  ✅ Added time slot for doctor ${slotData.doctorId} on day ${slotData.dayOfWeek}`);
        } else {
          console.log(`  ⏭️  Time slot already exists for doctor ${slotData.doctorId} on day ${slotData.dayOfWeek}`);
        }
      }
    }

    // Seed sample appointments (optional - for demonstration)
    const seedAppointments = process.argv.includes('--with-appointments');
    if (seedAppointments) {
      console.log('📅 Seeding sample appointments...');
      const appointmentRepository = dataSource.getRepository(Appointment);
      
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7); // 7 days from now
      const dateStr = futureDate.toISOString().split('T')[0];

      const appointmentsData = [
        {
          doctorId: doctors[0]?.id,
          patientName: 'Alice Johnson',
          patientEmail: 'alice.johnson@email.com',
          patientPhone: '+1-555-2001',
          appointmentDate: dateStr,
          appointmentTime: '10:00:00',
          endTime: '10:30:00',
          durationMinutes: 30,
          status: AppointmentStatus.SCHEDULED,
          notes: 'Annual cardiovascular checkup',
        },
        {
          doctorId: doctors[1]?.id,
          patientName: 'Bob Smith',
          patientEmail: 'bob.smith@email.com',
          patientPhone: '+1-555-2002',
          appointmentDate: dateStr,
          appointmentTime: '14:00:00',
          endTime: '14:30:00',
          durationMinutes: 30,
          status: AppointmentStatus.SCHEDULED,
          notes: 'Skin consultation for moles',
        },
        {
          doctorId: doctors[2]?.id,
          patientName: 'Charlie Brown',
          patientEmail: 'charlie.brown@email.com',
          patientPhone: '+1-555-2003',
          appointmentDate: dateStr,
          appointmentTime: '09:20:00',
          endTime: '09:40:00',
          durationMinutes: 20,
          status: AppointmentStatus.SCHEDULED,
          notes: 'Child vaccination - 6 months old',
        },
        // Historical appointments (completed)
        {
          doctorId: doctors[0]?.id,
          patientName: 'Grace Lee',
          patientEmail: 'grace.lee@email.com',
          patientPhone: '+1-555-2007',
          appointmentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days ago
          appointmentTime: '11:00:00',
          endTime: '11:30:00',
          durationMinutes: 30,
          status: AppointmentStatus.COMPLETED,
          notes: 'Routine cardiology checkup',
        },
        {
          doctorId: doctors[1]?.id,
          patientName: 'Henry Chen',
          patientEmail: 'henry.chen@email.com',
          patientPhone: '+1-555-2008',
          appointmentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days ago
          appointmentTime: '13:30:00',
          endTime: '14:00:00',
          durationMinutes: 30,
          status: AppointmentStatus.COMPLETED,
          notes: 'Acne treatment follow-up',
        },
        // Cancelled appointment
        {
          doctorId: doctors[2]?.id,
          patientName: 'Iris Taylor',
          patientEmail: 'iris.taylor@email.com',
          patientPhone: '+1-555-2009',
          appointmentDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 6 days from now
          appointmentTime: '10:40:00',
          endTime: '11:00:00',
          durationMinutes: 20,
          status: AppointmentStatus.CANCELLED,
          notes: 'Patient cancelled due to scheduling conflict',
        },
      ];

      for (const appointmentData of appointmentsData) {
        if (appointmentData.doctorId) {
          const existingAppointment = await appointmentRepository.findOneBy({
            doctorId: appointmentData.doctorId,
            patientEmail: appointmentData.patientEmail,
            appointmentDate: appointmentData.appointmentDate,
          });

          if (!existingAppointment) {
            const appointment = appointmentRepository.create(appointmentData);
            await appointmentRepository.save(appointment);
            console.log(`  ✅ Created appointment for ${appointmentData.patientName}`);
          } else {
            console.log(`  ⏭️  Appointment already exists for ${appointmentData.patientName}`);
          }
        }
      }
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log(`
📊 Summary:
  - ${doctors.length} doctors seeded
  - ${timeSlotsData.length} time slots seeded
  ${seedAppointments ? '- 6 sample appointments seeded (3 future, 2 completed, 1 cancelled)' : '- Run with --with-appointments to seed sample appointments'}

🚀 You can now start the application and use the API!
    `);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

// Run the seeding function
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase };