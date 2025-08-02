import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete,
  Body, 
  Param, 
  Query, 
  ParseIntPipe,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiBody
} from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { 
  CreateAppointmentDto, 
  UpdateAppointmentDto, 
  QueryAppointmentsDto,
  AppointmentResponseDto,
  AppointmentDetailResponseDto,
  PaginatedAppointmentsResponseDto
} from '../dto';

@ApiTags('appointments')
@Controller('api/v1/appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  /**
   * POST /api/v1/appointments
   * Book a new appointment with business rule validation
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Book new appointment',
    description: 'Create a new appointment with comprehensive validation including double-booking prevention, working hours validation, and conflict detection.' 
  })
  @ApiBody({ type: CreateAppointmentDto, description: 'Appointment booking details' })
  @ApiCreatedResponse({ 
    description: 'Appointment successfully booked',
    type: AppointmentResponseDto 
  })
  @ApiBadRequestResponse({ description: 'Invalid appointment data or validation errors' })
  @ApiConflictResponse({ description: 'Appointment conflict - doctor not available at the requested time' })
  @ApiNotFoundResponse({ description: 'Doctor not found' })
  async create(
    @Body() createAppointmentDto: CreateAppointmentDto
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.create(createAppointmentDto);
  }

  /**
   * GET /api/v1/appointments
   * Retrieve appointments with filtering and pagination
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get all appointments',
    description: 'Retrieve a paginated list of appointments with optional filtering by doctor, patient email, status, and date.' 
  })
  @ApiOkResponse({ 
    description: 'List of appointments successfully retrieved',
    type: PaginatedAppointmentsResponseDto 
  })
  @ApiBadRequestResponse({ description: 'Invalid query parameters' })
  @ApiQuery({ name: 'doctorId', required: false, description: 'Filter by doctor ID' })
  @ApiQuery({ name: 'patientEmail', required: false, description: 'Filter by patient email' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by appointment status' })
  @ApiQuery({ name: 'date', required: false, description: 'Filter by appointment date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page (default: 10, max: 100)' })
  async findAll(
    @Query() queryDto: QueryAppointmentsDto
  ): Promise<PaginatedAppointmentsResponseDto> {
    return this.appointmentsService.findAll(queryDto);
  }

  /**
   * GET /api/v1/appointments/:appointmentId
   * Get specific appointment details with doctor information
   */
  @Get(':appointmentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get appointment by ID',
    description: 'Retrieve detailed information about a specific appointment including doctor and patient details.' 
  })
  @ApiParam({ name: 'appointmentId', description: 'Unique identifier of the appointment', type: 'number' })
  @ApiOkResponse({ 
    description: 'Appointment details successfully retrieved',
    type: AppointmentDetailResponseDto 
  })
  @ApiNotFoundResponse({ description: 'Appointment not found' })
  @ApiBadRequestResponse({ description: 'Invalid appointment ID format' })
  async findOne(
    @Param('appointmentId', ParseIntPipe) appointmentId: number
  ): Promise<AppointmentDetailResponseDto> {
    return this.appointmentsService.findOne(appointmentId);
  }

  /**
   * PUT /api/v1/appointments/:appointmentId
   * Update appointment (reschedule or change status) with conflict validation
   */
  @Put(':appointmentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Update appointment',
    description: 'Update an existing appointment (reschedule, change status, or modify details) with full conflict validation.' 
  })
  @ApiParam({ name: 'appointmentId', description: 'Unique identifier of the appointment to update', type: 'number' })
  @ApiBody({ type: UpdateAppointmentDto, description: 'Updated appointment details' })
  @ApiOkResponse({ 
    description: 'Appointment successfully updated',
    type: AppointmentResponseDto 
  })
  @ApiNotFoundResponse({ description: 'Appointment not found' })
  @ApiBadRequestResponse({ description: 'Invalid appointment data or validation errors' })
  @ApiConflictResponse({ description: 'Update conflict - new time slot not available' })
  async update(
    @Param('appointmentId', ParseIntPipe) appointmentId: number,
    @Body() updateAppointmentDto: UpdateAppointmentDto
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.update(appointmentId, updateAppointmentDto);
  }

  /**
   * DELETE /api/v1/appointments/:appointmentId
   * Cancel/delete an appointment (soft delete - changes status to cancelled)
   */
  @Delete(':appointmentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Cancel appointment',
    description: 'Cancel an existing appointment by changing its status to cancelled (soft delete).' 
  })
  @ApiParam({ name: 'appointmentId', description: 'Unique identifier of the appointment to cancel', type: 'number' })
  @ApiOkResponse({ 
    description: 'Appointment successfully cancelled',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Appointment cancelled successfully' },
        data: { type: 'object' }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Appointment not found' })
  @ApiBadRequestResponse({ description: 'Invalid appointment ID format or appointment cannot be cancelled' })
  async remove(
    @Param('appointmentId', ParseIntPipe) appointmentId: number
  ): Promise<{ message: string; data: any }> {
    return this.appointmentsService.remove(appointmentId);
  }
}