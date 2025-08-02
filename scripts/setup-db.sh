#!/bin/bash

# Doctor Appointment API - Database Setup Script
# This script helps set up and manage the database for the doctor appointment system
# Supports both local PostgreSQL and hosted databases (like Render)

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Database configuration - supports both DATABASE_URL and individual parameters
if [ -n "$DATABASE_URL" ]; then
    # Parse DATABASE_URL for individual components (for display purposes)
    DB_URL_PARSED=$(echo "$DATABASE_URL" | sed -n 's|postgresql://\([^:]*\):\([^@]*\)@\([^:]*\):\([^/]*\)/\(.*\)|\1 \2 \3 \4 \5|p')
    read DB_USER DB_PASSWORD DB_HOST DB_PORT DB_NAME <<< "$DB_URL_PARSED"
    IS_HOSTED=true
    PSQL_CMD="psql '$DATABASE_URL'"
    print_status "Using hosted database connection (DATABASE_URL)"
    print_status "Database: $DB_NAME at $DB_HOST:$DB_PORT"
else
    # Use individual environment variables or defaults
    DB_NAME="${DB_DATABASE:-doctor_appointments}"
    DB_USER="${DB_USERNAME:-postgres}"
    DB_HOST="${DB_HOST:-localhost}"
    DB_PORT="${DB_PORT:-5432}"
    IS_HOSTED=false
    PSQL_CMD="psql -h $DB_HOST -p $DB_PORT -U $DB_USER"
    print_status "Using local database connection (individual parameters)"
    print_status "Database: $DB_NAME at $DB_HOST:$DB_PORT"
fi

# Function to check if PostgreSQL is running
check_postgres() {
    print_status "Checking PostgreSQL connection..."
    
    if [ "$IS_HOSTED" = true ]; then
        # For hosted databases, try a simple query to test connection
        if echo "SELECT 1;" | psql "$DATABASE_URL" >/dev/null 2>&1; then
            print_success "Hosted PostgreSQL database is accessible"
            return 0
        else
            print_error "Cannot connect to hosted database"
            print_status "Please verify your DATABASE_URL is correct"
            return 1
        fi
    else
        # For local databases, use pg_isready
        if pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" >/dev/null 2>&1; then
            print_success "Local PostgreSQL is running and accessible"
            return 0
        else
            print_error "Cannot connect to PostgreSQL at ${DB_HOST}:${DB_PORT}"
            print_status "Please ensure PostgreSQL is running and credentials are correct"
            return 1
        fi
    fi
}

# Function to create database if it doesn't exist (only for local databases)
create_database() {
    if [ "$IS_HOSTED" = true ]; then
        print_status "Using hosted database - skipping database creation"
        print_success "Hosted database '$DB_NAME' is ready"
        return 0
    fi
    
    print_status "Checking if database '$DB_NAME' exists..."
    
    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
        print_success "Database '$DB_NAME' already exists"
    else
        print_status "Creating database '$DB_NAME'..."
        createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"
        print_success "Database '$DB_NAME' created successfully"
    fi
}

# Function to run database schema
setup_schema() {
    print_status "Setting up database schema..."
    
    if [ -f "schemas/init.sql" ]; then
        if [ "$IS_HOSTED" = true ]; then
            psql "$DATABASE_URL" -f "schemas/init.sql"
        else
            psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "schemas/init.sql"
        fi
        print_success "Database schema created successfully"
    else
        print_error "Schema file 'schemas/init.sql' not found"
        print_status "Note: For hosted databases, ensure schema is already set up"
        return 1
    fi
}

# Function to seed database with sample data
seed_database() {
    local seed_type=${1:-"basic"}
    
    case $seed_type in
        "sql")
            print_status "Seeding database with SQL script..."
            if [ -f "scripts/seed.sql" ]; then
                if [ "$IS_HOSTED" = true ]; then
                    psql "$DATABASE_URL" -f "scripts/seed.sql"
                else
                    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "scripts/seed.sql"
                fi
                print_success "Database seeded successfully with SQL script"
            else
                print_error "Seed file 'scripts/seed.sql' not found"
                return 1
            fi
            ;;
        "typescript"|"ts")
            print_status "Seeding database with TypeScript script..."
            if [ -f "scripts/seed.ts" ]; then
                npm run seed
                print_success "Database seeded successfully with TypeScript script"
            else
                print_error "Seed file 'scripts/seed.ts' not found"
                return 1
            fi
            ;;
        "full")
            print_status "Seeding database with full data (including appointments)..."
            npm run seed:full
            print_success "Database seeded successfully with full data"
            ;;
        *)
            print_status "Seeding database with basic data..."
            npm run seed
            print_success "Database seeded successfully"
            ;;
    esac
}

# Function to reset database
reset_database() {
    print_warning "This will delete all data in the database!"
    read -p "Are you sure you want to reset the database? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [ "$IS_HOSTED" = true ]; then
            print_status "Clearing all data from hosted database..."
            # For hosted databases, clear data but don't drop/recreate
            echo "TRUNCATE TABLE appointment_history, appointments, doctor_time_slots, doctors RESTART IDENTITY CASCADE;" | psql "$DATABASE_URL"
            print_success "Database data cleared successfully"
        else
            print_status "Dropping database '$DB_NAME'..."
            dropdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" --if-exists
            
            print_status "Recreating database..."
            create_database
            setup_schema
            print_success "Database reset completed"
        fi
    else
        print_status "Database reset cancelled"
    fi
}

# Function to show database status
show_status() {
    print_status "Database Status for '$DB_NAME':"
    echo
    
    if [ "$IS_HOSTED" = true ]; then
        print_success "Using hosted database"
        
        # Show table counts for hosted database
        echo "📊 Table Summary:"
        psql "$DATABASE_URL" -c "
        SELECT 
            'doctors' as table_name, 
            COUNT(*) as record_count 
        FROM doctors
        UNION ALL
        SELECT 
            'doctor_time_slots' as table_name, 
            COUNT(*) as record_count 
        FROM doctor_time_slots
        UNION ALL
        SELECT 
            'appointments' as table_name, 
            COUNT(*) as record_count 
        FROM appointments
        ORDER BY table_name;
        " 2>/dev/null || print_warning "Could not retrieve table information"
    else
        # Check if local database exists
        if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
            print_success "Database exists"
            
            # Show table counts
            echo "📊 Table Summary:"
            psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
            SELECT 
                'doctors' as table_name, 
                COUNT(*) as record_count 
            FROM doctors
            UNION ALL
            SELECT 
                'doctor_time_slots' as table_name, 
                COUNT(*) as record_count 
            FROM doctor_time_slots
            UNION ALL
            SELECT 
                'appointments' as table_name, 
                COUNT(*) as record_count 
            FROM appointments
            ORDER BY table_name;
            " 2>/dev/null || print_warning "Could not retrieve table information"
            
        else
            print_error "Database does not exist"
        fi
    fi
}

# Function to show help
show_help() {
    echo "Doctor Appointment API - Database Setup Script"
    echo "Supports both local PostgreSQL and hosted databases (like Render)"
    echo
    echo "Usage: $0 [COMMAND]"
    echo
    echo "Commands:"
    echo "  setup       Set up database schema (hosted: just schema, local: create DB + schema)"
    echo "  seed        Seed database with sample data"
    echo "  seed-sql    Seed database using SQL script"
    echo "  seed-full   Seed database with full data including appointments"
    echo "  reset       Reset database (hosted: clear data, local: drop/recreate)"
    echo "  status      Show database status and table counts"
    echo "  check       Check PostgreSQL connection"
    echo "  help        Show this help message"
    echo
    echo "Environment Variables:"
    echo "  🌐 For hosted databases (like Render):"
    echo "    DATABASE_URL    Full PostgreSQL connection URL (automatically detected)"
    echo
    echo "  🏠 For local databases:"
    echo "    DB_DATABASE     Database name (default: doctor_appointments)"
    echo "    DB_USERNAME     Database user (default: postgres)" 
    echo "    DB_HOST         Database host (default: localhost)"
    echo "    DB_PORT         Database port (default: 5432)"
    echo
    echo "Examples:"
    echo "  🌐 Hosted database (Render):"
    echo "    DATABASE_URL='postgresql://...' $0 seed"
    echo "    $0 status    # Uses DATABASE_URL if available"
    echo
    echo "  🏠 Local database:"
    echo "    $0 setup     # Create database and schema"
    echo "    $0 seed      # Add sample data"
    echo "    $0 reset     # Reset everything"
    echo "    DB_DATABASE=mydb $0 setup  # Use custom database name"
}

# Main script logic
case ${1:-""} in
    "setup")
        print_status "Setting up database..."
        check_postgres && create_database && setup_schema
        print_success "Database setup completed!"
        print_status "Run '$0 seed' to add sample data"
        ;;
    "seed")
        print_status "Seeding database..."
        check_postgres && seed_database
        ;;
    "seed-sql")
        print_status "Seeding database with SQL..."
        check_postgres && seed_database "sql"
        ;;
    "seed-full")
        print_status "Seeding database with full data..."
        check_postgres && seed_database "full"
        ;;
    "reset")
        check_postgres && reset_database
        ;;
    "status")
        check_postgres && show_status
        ;;
    "check")
        check_postgres
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    "")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo
        show_help
        exit 1
        ;;
esac