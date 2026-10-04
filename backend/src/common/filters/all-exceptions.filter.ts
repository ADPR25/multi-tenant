import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

interface HttpExceptionBody {
  message?: string | string[];
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Error interno del servidor";

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === "string") {
        message = res;
      } else if (this.isExceptionBody(res)) {
        const rawMessage = res.message;
        message = Array.isArray(rawMessage)
          ? rawMessage.join(", ")
          : (rawMessage ?? exception.message);
      } else {
        message = exception.message;
      }
    } else if (exception instanceof Error) {
      if (exception.message.includes("TenantSubscriber")) {
        status = HttpStatus.BAD_REQUEST;
        message = exception.message;
      } else {
        this.logger.error(exception.message, exception.stack);
      }
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private isExceptionBody(value: unknown): value is HttpExceptionBody {
    return typeof value === "object" && value !== null && "message" in value;
  }
}
