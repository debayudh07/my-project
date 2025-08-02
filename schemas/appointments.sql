-- Appointments table schema
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    patient_name VARCHAR(255) NOT NULL,
    patient_email VARCHAR(255) NOT NULL,
    patient_phone VARCHAR(20) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(doctor_id, appointment_date, appointment_time)
);

-- Appointment history table for tracking changes
CREATE TABLE IF NOT EXISTS appointment_history (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by VARCHAR(255),
    change_reason TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_email ON appointments(patient_email);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date ON appointments(doctor_id, appointment_date);

-- Index for appointment history
CREATE INDEX IF NOT EXISTS idx_appointment_history_appointment_id ON appointment_history(appointment_id);