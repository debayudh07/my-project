# Doctor Appointment Booking API 🏥

A comprehensive **NestJS-based REST API** for managing doctor appointments with robust business logic, PostgreSQL database integration, and TypeORM. This system prevents double-booking, enforces working hours validation, and provides complete audit trails.

## ✨ Key Features

- 🔒 **Double-booking Prevention** - Transaction-based conflict detection
- ⏰ **Working Hours Validation** - Appointments only within doctor schedules
- 📊 **Complete Audit Trail** - Track all appointment changes
- 🔍 **Advanced Filtering & Pagination** - Search doctors and appointments
- 🛡️ **Input Validation** - Comprehensive DTO validation with error handling
- 📝 **RESTful API Design** - Versioned endpoints with proper HTTP methods
- 🏗️ **Modular Architecture** - Clean separation of concerns with NestJS modules

## 🚀 Tech Stack

- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL 
- **ORM**: TypeORM
- **Validation**: class-validator & class-transformer
- **Language**: TypeScript
- **Documentation**: Swagger/OpenAPI

## 🚀 Quick Start

### 🌐 For Hosted Database (Render)

Get the API running with your hosted database in 2 simple steps:

```bash
# 1. Install dependencies
npm install

# 2. Set DATABASE_URL and seed the database
export DATABASE_URL="your_render_database_url_here"
npm run seed:full

# 3. Start the server
npm run start:dev
```

### 🏠 For Local Development

Get the API running locally in 3 simple steps:

```bash
# 1. Install dependencies
npm install

# 2. Set up local database (ensure PostgreSQL is running)
createdb doctor_appointments
npm run seed:full

# 3. Start the server
npm run start:dev
```

**🎉 That's it!** Your API is now running at:
- **API**: http://localhost:3000
- **Documentation**: http://localhost:3000/api
- **Sample Endpoint**: http://localhost:3000/api/v1/doctors

## 📊 Database Schema

### Core Entities

| Entity | Description |
|--------|-------------|
| `doctors` | Doctor profiles with specializations and consultation fees |
| `doctor_time_slots` | Weekly recurring availability schedules |
| `appointments` | Patient appointment bookings with status tracking |
| `appointment_history` | Complete audit trail for all changes |

### Sample Data Included
- 5 doctors across different specializations
- Pre-configured working hours (Monday-Friday/Saturday)
- Various slot durations (20-60 minutes)

## 🔗 API Endpoints

### 🩺 Doctors API

| Method | Endpoint | Description | Query Parameters |
|--------|----------|-------------|------------------|
| `GET` | `/api/v1/doctors` | List all doctors | `specialization`, `available`, `page`, `limit` |
| `GET` | `/api/v1/doctors/:id` | Get doctor details | - |
| `GET` | `/api/v1/doctors/:id/available-slots` | Get available time slots | `date`, `duration` |

### 📅 Appointments API

| Method | Endpoint | Description | Body/Parameters |
|--------|----------|-------------|-----------------|
| `POST` | `/api/v1/appointments` | Book new appointment | `CreateAppointmentDto` |
| `GET` | `/api/v1/appointments` | List appointments | `doctorId`, `patientEmail`, `status`, `date` |
| `GET` | `/api/v1/appointments/:id` | Get appointment details | - |
| `PUT` | `/api/v1/appointments/:id` | Update/reschedule | `UpdateAppointmentDto` |
| `DELETE` | `/api/v1/appointments/:id` | Cancel appointment | - |

## 📚 API Usage Examples

### 📋 List Doctors with Filtering

```bash
# Get all doctors
curl -X GET "http://localhost:3000/api/v1/doctors"

# Filter by specialization
curl -X GET "http://localhost:3000/api/v1/doctors?specialization=Cardiology"

# Pagination
curl -X GET "http://localhost:3000/api/v1/doctors?page=1&limit=5"
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Dr. John Smith",
      "specialization": "Cardiology",
      "email": "john.smith@hospital.com",
      "phone": "+1-555-0101",
      "yearsOfExperience": 15,
      "consultationFee": 150.00,
      "isAvailable": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

### 🕒 Get Available Time Slots

```bash
curl -X GET "http://localhost:3000/api/v1/doctors/1/available-slots?date=2024-01-15&duration=30"
```

**Response:**
```json
{
  "doctorId": 1,
  "date": "2024-01-15",
  "availableSlots": [
    {
      "startTime": "09:00:00",
      "endTime": "09:30:00",
      "duration": 30
    },
    {
      "startTime": "09:30:00", 
      "endTime": "10:00:00",
      "duration": 30
    }
  ]
}
```

### 📝 Book an Appointment

```bash
curl -X POST "http://localhost:3000/api/v1/appointments" \
  -H "Content-Type: application/json" \
  -d '{
    "doctorId": 1,
    "patientName": "John Doe",
    "patientEmail": "john.doe@email.com",
    "patientPhone": "+1-555-1234",
    "appointmentDate": "2024-01-15",
    "appointmentTime": "09:00:00",
    "durationMinutes": 30,
    "notes": "Regular checkup"
  }'
```

**Response:**
```json
{
  "id": 1,
  "doctorId": 1,
  "patientName": "John Doe",
  "patientEmail": "john.doe@email.com",
  "patientPhone": "+1-555-1234",
  "appointmentDate": "2024-01-15",
  "appointmentTime": "09:00:00",
  "endTime": "09:30:00",
  "durationMinutes": 30,
  "status": "scheduled",
  "notes": "Regular checkup",
  "createdAt": "2024-01-10T10:30:00Z"
}
```

### 📊 List Appointments with Filtering

```bash
# Get all appointments
curl -X GET "http://localhost:3000/api/v1/appointments"

# Filter by doctor
curl -X GET "http://localhost:3000/api/v1/appointments?doctorId=1"

# Filter by patient email
curl -X GET "http://localhost:3000/api/v1/appointments?patientEmail=john.doe@email.com"

# Filter by status and date
curl -X GET "http://localhost:3000/api/v1/appointments?status=scheduled&date=2024-01-15"
```

### ✏️ Update an Appointment

```bash
curl -X PUT "http://localhost:3000/api/v1/appointments/1" \
  -H "Content-Type: application/json" \
  -d '{
    "appointmentDate": "2024-01-16",
    "appointmentTime": "10:00:00",
    "notes": "Rescheduled - Updated checkup"
  }'
```

### ❌ Cancel an Appointment

```bash
curl -X DELETE "http://localhost:3000/api/v1/appointments/1"
```

## 🛠️ Installation & Setup

### Prerequisites

- **Node.js** (v18+)
- **PostgreSQL** (local setup) or **Hosted Database** (Render, etc.)
- **npm** or **yarn**

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd my-project

# Install dependencies
npm install
```

### 2. Database Setup

Choose one of the following setups based on your database type:

#### 🌐 **Option A: Hosted Database (Render, etc.)**

```bash
# No local PostgreSQL installation needed!
# Your hosted database is already created and running

# Set your database connection (get this from your Render dashboard)
export DATABASE_URL="postgresql://username:password@host:port/database"

# Or add to .env file:
echo "DATABASE_URL=your_render_database_url_here" > .env
```

#### 🏠 **Option B: Local PostgreSQL**

```bash
# Create PostgreSQL database
createdb doctor_appointments

# Initialize database with schema and sample data
psql -d doctor_appointments -f schemas/init.sql
```

### 3. Environment Configuration

#### For Hosted Database (.env file):
```env
# Hosted Database (Required)
DATABASE_URL=postgresql://username:password@host:port/database

# Application Configuration
NODE_ENV=production
PORT=3000

# CORS Configuration
FRONTEND_URL=http://localhost:3001
```

#### For Local Database (.env file):
```env
# Local Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=doctor_appointments

# Application Configuration
NODE_ENV=development
PORT=3000

# CORS Configuration
FRONTEND_URL=http://localhost:3001
```

### 4. Run the Application

```bash
# Development mode (with auto-reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at: **http://localhost:3000**

## 🔧 Database Management

### 🌱 Database Seeding Scripts

The project includes comprehensive seeding options that work with both **hosted databases (Render)** and **local PostgreSQL**:

#### **🚀 Quick Start - NPM Scripts**

Works with both hosted and local databases automatically:

```bash
# Basic seeding (doctors + time slots)
npm run seed

# Clear existing data and seed fresh
npm run seed:clear

# Seed with sample appointments
npm run seed:with-appointments

# Complete fresh setup (clear + full data)
npm run seed:full

# Use SQL script directly
npm run seed:sql
```

#### **🌐 For Hosted Databases (Render)**

```bash
# Set your DATABASE_URL first
export DATABASE_URL="your_render_database_url"

# Then run any seeding command
npm run seed:full                    # Recommended for first-time setup
npm run seed                         # Basic doctors and time slots
npm run seed:with-appointments       # Include sample appointments

# Or use the setup script
./scripts/setup-db.sh seed           # Basic seeding
./scripts/setup-db.sh seed-full      # Full seeding with appointments
./scripts/setup-db.sh status         # Check database status
```

#### **🏠 For Local Development**

```bash
# TypeScript Seed Script
ts-node scripts/seed.ts

# Available options:
ts-node scripts/seed.ts --clear              # Clear existing data
ts-node scripts/seed.ts --with-appointments  # Include sample appointments
ts-node scripts/seed.ts --clear --with-appointments  # Full reset with data

# SQL Seed Script (local only)
psql -d doctor_appointments -f scripts/seed.sql

# Database Setup Helper (Linux/Mac)
chmod +x scripts/setup-db.sh        # Make executable (first time only)

./scripts/setup-db.sh setup         # Create database + schema
./scripts/setup-db.sh seed          # Add sample data
./scripts/setup-db.sh reset         # Reset everything
./scripts/setup-db.sh status        # Check database status
```

### 🎯 What Gets Seeded

- **10 Doctors** across multiple specializations:
  - Cardiology, Dermatology, Pediatrics, Neurology
  - Orthopedics, Psychiatry, Ophthalmology, OB/GYN
  - Internal Medicine, Endocrinology
- **Realistic Schedule Patterns**:
  - Different working hours per specialty
  - Various appointment durations (20-60 minutes)
  - Weekend availability for some doctors
- **Sample Appointments** (optional):
  - Future appointments for testing booking conflicts
  - Historical completed appointments
  - Cancelled appointments for status testing

### Manual Setup (Alternative)

#### For Hosted Databases:
```bash
# Connect to your hosted database and run schema
psql "$DATABASE_URL" -f schemas/init.sql

# Or seed directly with SQL
psql "$DATABASE_URL" -f scripts/seed.sql
```

#### For Local Databases:
```sql
-- Create database
CREATE DATABASE doctor_appointments;

-- Connect and run individual schema files
\i schemas/doctors.sql
\i schemas/appointments.sql

-- Add sample data
\i schemas/init.sql
```

### Reset Database

#### For Hosted Databases:
```bash
# Clear all data (safer for hosted databases)
./scripts/setup-db.sh reset    # Will clear data, not drop database

# Or use npm script
npm run seed:full              # Clears and reseeds
```

#### For Local Databases:
```bash
# Drop and recreate (local only)
dropdb doctor_appointments && createdb doctor_appointments
psql -d doctor_appointments -f schemas/init.sql

# Or use the helper script (Linux/Mac)
./scripts/setup-db.sh reset

# Or use npm script
npm run seed:full
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🚦 Business Rules Enforced

### 🔒 Double-booking Prevention
- **Database Transactions**: Ensures atomicity during booking
- **Conflict Detection**: Checks for overlapping appointments
- **Real-time Validation**: Prevents simultaneous bookings

### ⏰ Working Hours Validation
- **Doctor Schedules**: Appointments only within defined time slots
- **Day Validation**: Respects doctor's working days
- **Duration Limits**: 15-180 minutes per appointment

### 📝 Input Validation
- **Email Format**: Valid email addresses required
- **Phone Numbers**: International format support
- **Date/Time**: ISO format validation
- **Required Fields**: Comprehensive validation

### 🔍 Error Handling
- **Custom Exceptions**: Meaningful error messages
- **HTTP Status Codes**: Proper REST responses
- **Global Filters**: Consistent error formatting

## 📖 API Documentation

### 🔗 Interactive Swagger Documentation

The API includes comprehensive OpenAPI/Swagger documentation with:
- **Interactive API Explorer**: Test endpoints directly from the browser
- **Request/Response Examples**: See exactly what to send and expect
- **Authentication Support**: Built-in auth testing capabilities
- **Schema Validation**: Understand all request/response formats

**Access at**: **http://localhost:3000/api**

### 📝 Swagger Features
- ✅ **Complete Endpoint Coverage**: All routes documented
- ✅ **Request Validation**: Interactive form validation
- ✅ **Response Examples**: Real response samples
- ✅ **Error Handling**: Comprehensive error documentation
- ✅ **Try It Out**: Test API calls directly from docs

## 🏗️ Project Structure

```
my-project/
├── schemas/                    # PostgreSQL database schemas
│   ├── doctors.sql
│   ├── appointments.sql
│   └── init.sql               # Complete setup + sample data
├── scripts/                   # Database and utility scripts
│   ├── seed.ts                # TypeScript seeding script
│   ├── seed.sql               # SQL seeding script
│   └── setup-db.sh            # Database management helper
├── src/
│   ├── entities/              # TypeORM entities
│   ├── dto/                   # Data Transfer Objects with Swagger decorators
│   ├── doctors/               # Doctors module (controller, service, module)
│   ├── appointments/          # Appointments module (controller, service, module)
│   ├── common/
│   │   ├── exceptions/        # Custom exception classes
│   │   └── filters/           # Global exception filter
│   ├── app.module.ts          # Main application module
│   └── main.ts                # Application bootstrap with Swagger setup
├── test/                      # E2E tests
├── package.json               # Dependencies and scripts
└── README.md                  # This comprehensive guide
```

## 🔄 Development Workflow

1. **Make Changes**: Edit source code in `src/`
2. **Auto Reload**: Development server restarts automatically
3. **Test**: Run tests to ensure functionality
4. **Validate**: Check API responses with Swagger docs
5. **Deploy**: Build and deploy to production

## 📊 Sample Data

The system comes pre-loaded with:

- **5 Doctors** across specializations:
  - Dr. John Smith (Cardiology) - $150/consultation
  - Dr. Sarah Johnson (Dermatology) - $120/consultation  
  - Dr. Michael Brown (Pediatrics) - $100/consultation
  - Dr. Emily Davis (Neurology) - $180/consultation
  - Dr. Robert Wilson (Orthopedics) - $160/consultation

- **Working Hours**: Monday-Friday (some Saturday)
- **Slot Durations**: 20-60 minutes depending on specialty

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Check PostgreSQL service
sudo systemctl status postgresql

# Verify database exists
psql -l | grep doctor_appointments
```

**Port Already in Use**
```bash
# Change port in .env file
PORT=3001
```

**Validation Errors**
- Check request body format matches DTO requirements
- Ensure all required fields are provided
- Verify date/time formats (YYYY-MM-DD, HH:MM:SS)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Related Documentation

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## 🌐 Render Database Setup

### Getting Your DATABASE_URL from Render

1. **Go to your Render Dashboard** → Your PostgreSQL service
2. **Copy the External Database URL** (starts with `postgresql://`)
3. **Set it as environment variable:**

```bash
# Option 1: Export in terminal
export DATABASE_URL="postgresql://username:password@host:port/database"

# Option 2: Add to .env file
echo "DATABASE_URL=postgresql://username:password@host:port/database" >> .env

# Option 3: Set in your deployment environment
```

### Quick Render Setup

```bash
# 1. Get your DATABASE_URL from Render dashboard
# 2. Set the environment variable
export DATABASE_URL="your_render_database_url"

# 3. Install dependencies
npm install

# 4. Seed your database
npm run seed:full

# 5. Start the application
npm run start:dev
```

### Verify Setup

```bash
# Check connection and database status
./scripts/setup-db.sh check
./scripts/setup-db.sh status

# Should show:
# ✅ Hosted PostgreSQL database is accessible
# 📊 Table Summary with doctor/appointment counts
```

### Troubleshooting Render Connection

```bash
# Test direct connection
psql "$DATABASE_URL" -c "SELECT version();"

# Check environment variable is set
echo $DATABASE_URL

# Verify seeding worked
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM doctors;"
```

---

**🚀 Ready to use! Start the server and begin booking appointments.**