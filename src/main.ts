import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global validation pipe with transformation
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // Global exception filter for consistent error handling
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Enable CORS for frontend integration - Allow all origins
  app.enableCors({
    origin: true, // Allow all origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Swagger/OpenAPI Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Doctor Appointment Booking API')
    .setDescription('A comprehensive REST API for managing doctor appointments with robust business logic, PostgreSQL database integration, and TypeORM. This system prevents double-booking, enforces working hours validation, and provides complete audit trails.')
    .setVersion('1.0')
    .addTag('doctors', 'Doctor management and availability')
    .addTag('appointments', 'Appointment booking and management')
    .setContact('API Support', 'https://github.com/yourusername/doctor-appointment-api', 'support@doctorapi.com')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer(`http://localhost:${process.env.PORT || 3000}`, 'Development server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'Doctor Appointment API',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showRequestHeaders: true,
      tryItOutEnabled: true,
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Doctor Appointment API is running on: http://localhost:${port}`);
  console.log(`📋 API Documentation (Swagger): http://localhost:${port}/api`);
  console.log(`🏥 Available endpoints:`);
  console.log(`   GET  /api/v1/doctors - List doctors`);
  console.log(`   GET  /api/v1/doctors/:id/available-slots - Get available slots`);
  console.log(`   POST /api/v1/appointments - Book appointment`);
  console.log(`   GET  /api/v1/appointments - List appointments`);
}
bootstrap();
