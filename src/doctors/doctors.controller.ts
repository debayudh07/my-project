import { 
  Controller, 
  Get, 
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
  ApiNotFoundResponse,
  ApiBadRequestResponse
} from '@nestjs/swagger';
import { DoctorsService } from './doctors.service';
import { 
  QueryDoctorsDto, 
  QueryAvailableSlotsDto,
  DoctorDetailResponseDto,
  PaginatedDoctorsResponseDto,
  AvailableSlotsResponseDto
} from '../dto';

@ApiTags('doctors')
@Controller('api/v1/doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  /**
   * GET /api/v1/doctors
   * Retrieve list of all available doctors with filtering and pagination
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get all doctors',
    description: 'Retrieve a paginated list of all available doctors with optional filtering by specialization and availability status.' 
  })
  @ApiOkResponse({ 
    description: 'List of doctors successfully retrieved',
    type: PaginatedDoctorsResponseDto 
  })
  @ApiBadRequestResponse({ description: 'Invalid query parameters' })
  @ApiQuery({ name: 'specialization', required: false, description: 'Filter by doctor specialization' })
  @ApiQuery({ name: 'available', required: false, description: 'Filter by availability status' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page (default: 10, max: 100)' })
  async findAll(
    @Query() queryDto: QueryDoctorsDto
  ): Promise<PaginatedDoctorsResponseDto> {
    return this.doctorsService.findAll(queryDto);
  }

  /**
   * GET /api/v1/doctors/:doctorId
   * Get specific doctor details including time slots
   */
  @Get(':doctorId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get doctor by ID',
    description: 'Retrieve detailed information about a specific doctor including their time slots and availability schedule.' 
  })
  @ApiParam({ name: 'doctorId', description: 'Unique identifier of the doctor', type: 'number' })
  @ApiOkResponse({ 
    description: 'Doctor details successfully retrieved',
    type: DoctorDetailResponseDto 
  })
  @ApiNotFoundResponse({ description: 'Doctor not found' })
  @ApiBadRequestResponse({ description: 'Invalid doctor ID format' })
  async findOne(
    @Param('doctorId', ParseIntPipe) doctorId: number
  ): Promise<DoctorDetailResponseDto> {
    return this.doctorsService.findOne(doctorId);
  }

  /**
   * GET /api/v1/doctors/:doctorId/available-slots
   * Get available time slots for a specific doctor on a given date
   */
  @Get(':doctorId/available-slots')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get available time slots',
    description: 'Retrieve available appointment slots for a specific doctor on a given date, excluding already booked appointments.' 
  })
  @ApiParam({ name: 'doctorId', description: 'Unique identifier of the doctor', type: 'number' })
  @ApiQuery({ name: 'date', required: true, description: 'Date to check availability (YYYY-MM-DD format)' })
  @ApiQuery({ name: 'duration', required: false, description: 'Desired appointment duration in minutes (default: doctor\'s slot duration)' })
  @ApiOkResponse({ 
    description: 'Available time slots successfully retrieved',
    type: AvailableSlotsResponseDto 
  })
  @ApiNotFoundResponse({ description: 'Doctor not found' })
  @ApiBadRequestResponse({ description: 'Invalid doctor ID or date format' })
  async getAvailableSlots(
    @Param('doctorId', ParseIntPipe) doctorId: number,
    @Query() queryDto: QueryAvailableSlotsDto
  ): Promise<AvailableSlotsResponseDto> {
    return this.doctorsService.getAvailableSlots(doctorId, queryDto);
  }
}