-- Doctors table schema
CREATE TABLE IF NOT EXISTS doctors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    specialization VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    years_of_experience INTEGER DEFAULT 0,
    consultation_fee DECIMAL(10, 2) DEFAULT 0.00,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Doctor availability time slots table
CREATE TABLE IF NOT EXISTS doctor_time_slots (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration_minutes INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(doctor_id, day_of_week, start_time)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_doctors_specialization ON doctors(specialization);
CREATE INDEX IF NOT EXISTS idx_doctors_available ON doctors(is_available);
CREATE INDEX IF NOT EXISTS idx_doctor_time_slots_doctor_id ON doctor_time_slots(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_time_slots_day ON doctor_time_slots(day_of_week);