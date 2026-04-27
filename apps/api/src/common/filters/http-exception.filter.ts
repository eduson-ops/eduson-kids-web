import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { Logger } from 'nestjs-pino';

interface ErrorResponseBody {
  error: string;
  code: number;
  requestId?: string;
  message?: string | string[];
  details?: unknown;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(Logger) private readonly logger: Logger,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isProduction = this.config.get<boolean>('isProduction') ?? false;
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const requestId = (request.headers['x-request-id'] as string) ?? 'unknown';

    if (status >= 500) {
      this.logger.error(
        {
          requestId,
          url: request.url,
          method: request.method,
          statusCode: status,
          error: exception instanceof Error ? exception.message : String(exception),
          stack: exception instanceof Error ? exception.stack : undefined,
        },
        'Unhandled exception',
      );
    }

    const body: ErrorResponseBody = isProduction
      ? { error: 'INTERNAL_ERROR', code: status, requestId }
      : this.buildDevResponse(exception, status, requestId);

    response.status(status).json(body);
  }

  private buildDevResponse(exception: unknown, status: number, requestId: string): ErrorResponseBody {
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null) {
        return {
          ...(res as Record<string, unknown>),
          code: status,
          requestId,
        } as ErrorResponseBody;
      }
      return { error: String(res), code: status, requestId };
    }

    return {
      error: exception instanceof Error ? exception.message : 'Unknown error',
      code: status,
      requestId,
      details: exception instanceof Error ? exception.stack : undefined,
    };
  }
}
