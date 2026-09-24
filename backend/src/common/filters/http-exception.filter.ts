import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Terjadi kesalahan server.';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') message = body;
      else if (typeof body === 'object' && body !== null) {
        const m = (body as Record<string, unknown>).message;
        if (typeof m === 'string' || Array.isArray(m)) message = m as string | string[];
        else message = exception.message;
      }
    } else if (exception instanceof Error) {
      message = exception.message || message;
    }

    res.status(status).json({
      success: false,
      message,
      path: req.url,
      timestamp: new Date().toISOString(),
    });
  }
}
