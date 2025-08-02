import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: any = {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
        path: request.url
      }
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        // Custom exceptions (like our appointment exceptions)
        errorResponse = exceptionResponse;
      } else {
        // Standard HTTP exceptions
        errorResponse = {
          error: {
            code: exception.constructor.name.replace('Exception', '').toUpperCase(),
            message: exception.message,
            timestamp: new Date().toISOString(),
            path: request.url
          }
        };
      }
    } else if (exception instanceof Error) {
      // Generic errors
      errorResponse.error.message = exception.message;
      errorResponse.error.code = 'APPLICATION_ERROR';
    }

    // Log error for debugging
    console.error('Exception caught:', {
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error: exception
    });

    response.status(status).json(errorResponse);
  }
}