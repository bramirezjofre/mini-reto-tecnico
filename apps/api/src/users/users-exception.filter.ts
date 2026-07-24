import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { GitHubUpstreamError, UserNotFoundError } from './github.service';

@Catch()
export class UsersExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(UsersExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof UserNotFoundError) {
      response
        .status(HttpStatus.NOT_FOUND)
        .json({ statusCode: 404, message: exception.message });
      return;
    }

    if (exception instanceof GitHubUpstreamError) {
      this.logger.error(exception.message);
      response.status(HttpStatus.BAD_GATEWAY).json({
        statusCode: 502,
        message: 'Upstream GitHub API error',
      });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      response.status(status).json(exception.getResponse());
      return;
    }

    this.logger.error(
      `Unhandled error on ${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : String(exception),
    );
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: 500,
      message: 'Internal server error',
    });
  }
}
