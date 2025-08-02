-- Enhanced database seed script with more comprehensive sample data
-- Run this script to populate your doctor appointment database with sample data
-- Works with both local PostgreSQL and hosted databases (Render, etc.)
--
-- Usage:
--   Local:  psql -d doctor_appointments -f scripts/seed.sql
--   Hosted: psql "$DATABASE_URL" -f scripts/seed.sql

-- Clear existing data (optional - be careful in production!)
-- TRUNCATE TABLE appointment_history, appointments, doctor_time_slots, doctors RESTART IDENTITY CASCADE;

-- Seed doctors with diverse specializations
INSERT INTO doctors (name, specialization, email, phone, years_of_experience, consultation_fee, is_available) VALUES
('Dr. John Smith', 'Cardiology', 'john.smith@hospital.com', '+1-555-0101', 15, 150.00, true),
('Dr. Sarah Johnson', 'Dermatology', 'sarah.johnson@hospital.com', '+1-555-0102', 8, 120.00, true),
('Dr. Michael Brown', 'Pediatrics', 'michael.brown@hospital.com', '+1-555-0103', 12, 100.00, true),
('Dr. Emily Davis', 'Neurology', 'emily.davis@hospital.com', '+1-555-0104', 10, 180.00, true),
('Dr. Robert Wilson', 'Orthopedics', 'robert.wilson@hospital.com', '+1-555-0105', 20, 160.00, true),
('Dr. Lisa Rodriguez', 'Psychiatry', 'lisa.rodriguez@hospital.com', '+1-555-0106', 7, 140.00, true),
('Dr. David Kim', 'Ophthalmology', 'david.kim@hospital.com', '+1-555-0107', 14, 130.00, false),
('Dr. Maria Garcia', 'Obstetrics & Gynecology', 'maria.garcia@hospital.com', '+1-555-0108', 11, 165.00, true),
('Dr. James Thompson', 'Internal Medicine', 'james.thompson@hospital.com', '+1-555-0109', 18, 135.00, true),
('Dr. Jennifer Lee', 'Endocrinology', 'jennifer.lee@hospital.com', '+1-555-0110', 9, 155.00, true)
ON CONFLICT (email) DO NOTHING;

-- Seed time slots for each doctor with realistic schedules
-- Dr. John Smith (Cardiology) - Monday to Friday, 9 AM to 5 PM, 30-minute slots
INSERT INTO doctor_time_slots (doctor_id, day_of_week, start_time, end_time, slot_duration_minutes) VALUES
(1, 1, '09:00:00', '17:00:00', 30), -- Monday
(1, 2, '09:00:00', '17:00:00', 30), -- Tuesday
(1, 3, '09:00:00', '17:00:00', 30), -- Wednesday
(1, 4, '09:00:00', '17:00:00', 30), -- Thursday
(1, 5, '09:00:00', '17:00:00', 30), -- Friday

-- Dr. Sarah Johnson (Dermatology) - Monday to Friday, 10 AM to 6 PM, 30-minute slots
(2, 1, '10:00:00', '18:00:00', 30),
(2, 2, '10:00:00', '18:00:00', 30),
(2, 3, '10:00:00', '18:00:00', 30),
(2, 4, '10:00:00', '18:00:00', 30),
(2, 5, '10:00:00', '18:00:00', 30),

-- Dr. Michael Brown (Pediatrics) - Monday to Saturday, 8 AM to 4 PM, 20-minute slots
(3, 1, '08:00:00', '16:00:00', 20),
(3, 2, '08:00:00', '16:00:00', 20),
(3, 3, '08:00:00', '16:00:00', 20),
(3, 4, '08:00:00', '16:00:00', 20),
(3, 5, '08:00:00', '16:00:00', 20),
(3, 6, '09:00:00', '13:00:00', 20), -- Saturday morning only

-- Dr. Emily Davis (Neurology) - Monday to Friday, 11 AM to 7 PM, 45-minute slots
(4, 1, '11:00:00', '19:00:00', 45),
(4, 2, '11:00:00', '19:00:00', 45),
(4, 3, '11:00:00', '19:00:00', 45),
(4, 4, '11:00:00', '19:00:00', 45),
(4, 5, '11:00:00', '19:00:00', 45),

-- Dr. Robert Wilson (Orthopedics) - Monday to Friday, 7 AM to 3 PM, 60-minute slots
(5, 1, '07:00:00', '15:00:00', 60),
(5, 2, '07:00:00', '15:00:00', 60),
(5, 3, '07:00:00', '15:00:00', 60),
(5, 4, '07:00:00', '15:00:00', 60),
(5, 5, '07:00:00', '15:00:00', 60),

-- Dr. Lisa Rodriguez (Psychiatry) - Monday to Friday, 12 PM to 8 PM, 50-minute slots
(6, 1, '12:00:00', '20:00:00', 50),
(6, 2, '12:00:00', '20:00:00', 50),
(6, 3, '12:00:00', '20:00:00', 50),
(6, 4, '12:00:00', '20:00:00', 50),
(6, 5, '12:00:00', '20:00:00', 50),

-- Dr. David Kim (Ophthalmology) - Limited schedule (currently less available)
(7, 2, '14:00:00', '17:00:00', 25), -- Tuesday afternoon
(7, 4, '14:00:00', '17:00:00', 25), -- Thursday afternoon

-- Dr. Maria Garcia (OB/GYN) - Monday to Friday, 8 AM to 4 PM, 40-minute slots
(8, 1, '08:00:00', '16:00:00', 40),
(8, 2, '08:00:00', '16:00:00', 40),
(8, 3, '08:00:00', '16:00:00', 40),
(8, 4, '08:00:00', '16:00:00', 40),
(8, 5, '08:00:00', '16:00:00', 40),

-- Dr. James Thompson (Internal Medicine) - Monday to Friday, 9 AM to 6 PM, 30-minute slots
(9, 1, '09:00:00', '18:00:00', 30),
(9, 2, '09:00:00', '18:00:00', 30),
(9, 3, '09:00:00', '18:00:00', 30),
(9, 4, '09:00:00', '18:00:00', 30),
(9, 5, '09:00:00', '18:00:00', 30),

-- Dr. Jennifer Lee (Endocrinology) - Monday to Friday, 10 AM to 5 PM, 35-minute slots
(10, 1, '10:00:00', '17:00:00', 35),
(10, 2, '10:00:00', '17:00:00', 35),
(10, 3, '10:00:00', '17:00:00', 35),
(10, 4, '10:00:00', '17:00:00', 35),
(10, 5, '10:00:00', '17:00:00', 35)

ON CONFLICT (doctor_id, day_of_week, start_time) DO NOTHING;

-- Sample appointments (optional - for demonstration purposes)
-- Note: Adjust dates to be in the future for your testing
INSERT INTO appointments (
  doctor_id, 
  patient_name, 
  patient_email, 
  patient_phone, 
  appointment_date, 
  appointment_time, 
  end_time,
  duration_minutes, 
  status, 
  notes
) VALUES
-- Future appointments for testing
(1, 'Alice Johnson', 'alice.johnson@email.com', '+1-555-2001', (CURRENT_DATE + INTERVAL '7 days'), '10:00:00', '10:30:00', 30, 'scheduled', 'Annual cardiovascular checkup'),
(1, 'Bob Williams', 'bob.williams@email.com', '+1-555-2002', (CURRENT_DATE + INTERVAL '8 days'), '14:00:00', '14:30:00', 30, 'scheduled', 'Follow-up for hypertension'),
(2, 'Carol Davis', 'carol.davis@email.com', '+1-555-2003', (CURRENT_DATE + INTERVAL '5 days'), '11:00:00', '11:30:00', 30, 'scheduled', 'Skin consultation for moles'),
(3, 'David Brown', 'david.brown@email.com', '+1-555-2004', (CURRENT_DATE + INTERVAL '3 days'), '09:20:00', '09:40:00', 20, 'scheduled', 'Child vaccination - 18 months'),
(4, 'Eva Martinez', 'eva.martinez@email.com', '+1-555-2005', (CURRENT_DATE + INTERVAL '10 days'), '15:00:00', '15:45:00', 45, 'scheduled', 'Neurological consultation for headaches'),
(5, 'Frank Wilson', 'frank.wilson@email.com', '+1-555-2006', (CURRENT_DATE + INTERVAL '12 days'), '08:00:00', '09:00:00', 60, 'scheduled', 'Knee replacement consultation'),

-- Historical appointments (completed)
(1, 'Grace Lee', 'grace.lee@email.com', '+1-555-2007', (CURRENT_DATE - INTERVAL '5 days'), '11:00:00', '11:30:00', 30, 'completed', 'Routine cardiology checkup'),
(2, 'Henry Chen', 'henry.chen@email.com', '+1-555-2008', (CURRENT_DATE - INTERVAL '3 days'), '13:30:00', '14:00:00', 30, 'completed', 'Acne treatment follow-up'),

-- Cancelled appointment
(3, 'Iris Taylor', 'iris.taylor@email.com', '+1-555-2009', (CURRENT_DATE + INTERVAL '6 days'), '10:40:00', '11:00:00', 20, 'cancelled', 'Patient cancelled due to scheduling conflict')

ON CONFLICT DO NOTHING;

-- Display summary
DO $$
DECLARE
  doctor_count INTEGER;
  slot_count INTEGER;
  appointment_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO doctor_count FROM doctors;
  SELECT COUNT(*) INTO slot_count FROM doctor_time_slots;
  SELECT COUNT(*) INTO appointment_count FROM appointments;
  
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Database seeding completed successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Summary:';
  RAISE NOTICE '  - % doctors seeded', doctor_count;
  RAISE NOTICE '  - % time slots configured', slot_count;
  RAISE NOTICE '  - % sample appointments created', appointment_count;
  RAISE NOTICE '';
  RAISE NOTICE '🚀 You can now start the application and use the API!';
  RAISE NOTICE '   http://localhost:3000/api - Swagger documentation';
  RAISE NOTICE '   http://localhost:3000/api/v1/doctors - List doctors';
  RAISE NOTICE '';
END $$;