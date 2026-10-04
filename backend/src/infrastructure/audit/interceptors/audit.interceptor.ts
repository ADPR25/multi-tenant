import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable, tap } from "rxjs";
import { AuditService } from "@/infrastructure/audit/audit.service";
import { Request } from "express";
import { CurrentUserPayload } from "@/common/decorators/current-company.decorator";

const SENSITIVE_FIELDS = [
  "password",
  "currentPassword",
  "newPassword",
  "refresh_token",
  "refreshToken",
  "secret",
] as const;

type Sanitizable = Record<string, unknown>;

function sanitize<T extends Sanitizable | undefined>(obj: T): T {
  if (!obj || typeof obj !== "object") return obj;
  const clone: Sanitizable = { ...obj };
  for (const field of SENSITIVE_FIELDS) {
    if (field in clone) clone[field] = "[REDACTED]";
  }
  return clone as T;
}

interface RequestWithUser extends Request {
  user?: CurrentUserPayload;
}

interface AuditableResult {
  id?: string;
}

interface AuditError {
  message?: string;
  status?: number;
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditService: AuditService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<AuditableResult>,
  ): Observable<AuditableResult> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const method = request.method;
    if (!["POST", "PATCH", "DELETE"].includes(method)) return next.handle();
    if (
      request.url.includes("auth/login") ||
      request.url.includes("auth/refresh")
    ) {
      return next.handle();
    }

    const start = Date.now();
    return next.handle().pipe(
      tap({
        next: (result) => {
          const user = request.user;
          if (!user?.companyId) return;
          void this.auditService.log({
            companyId: user.companyId,
            userId: user.id,
            action: `${method}_SUCCESS`,
            resource: `${context.getClass().name}.${context.getHandler().name}`,
            resourceId: result?.id ?? (request.params as { id?: string })?.id,
            details: {
              status: "SUCCESS",
              durationMs: Date.now() - start,
              body: sanitize(request.body as Sanitizable),
              params: request.params,
              query: request.query,
              responseId: result?.id,
            },
          });
        },
        error: (error: AuditError) => {
          const user = request.user;
          if (!user?.companyId) return;
          void this.auditService.log({
            companyId: user.companyId,
            userId: user.id,
            action: `${method}_FAILED`,
            resource: `${context.getClass().name}.${context.getHandler().name}`,
            resourceId: (request.params as { id?: string })?.id,
            details: {
              status: "FAILED",
              durationMs: Date.now() - start,
              body: sanitize(request.body as Sanitizable),
              params: request.params,
              query: request.query,
              error: error?.message ?? "Error desconocido",
              statusCode: error?.status,
            },
          });
        },
      }),
    );
  }
}
