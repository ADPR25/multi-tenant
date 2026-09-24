import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable, tap } from "rxjs";
import { AuditService } from "@/infrastructure/audit/audit.service";

const SENSITIVE_FIELDS = ['password', 'currentPassword', 'newPassword', 'refresh_token', 'refreshToken', 'secret'];

function sanitize(obj: any): any {
  if (!obj || typeof obj!== 'object') return obj;
  const clone = {...obj };
  for (const field of SENSITIVE_FIELDS) {
    if (field in clone) clone[field] = '[REDACTED]';
  }
  return clone;
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    if (!["POST", "PATCH", "DELETE"].includes(method)) return next.handle();
    if (request.url.includes("auth/login") || request.url.includes("auth/refresh")) {
      return next.handle();
    }

    const start = Date.now();
    return next.handle().pipe(
      tap({
        next: (result) => {
          const user = request.user;
          if (!user?.companyId) return;
          this.auditService.log({
            companyId: user.companyId,
            userId: user.id,
            action: `${method}_SUCCESS`,
            resource: `${context.getClass().name}.${context.getHandler().name}`,
            resourceId: result?.id || request.params?.id,
            details: {
              status: 'SUCCESS',
              durationMs: Date.now() - start,
              body: sanitize(request.body),
              params: request.params,
              query: request.query,
              responseId: result?.id,
            },
          });
        },
        error: (error) => {
          const user = request.user;
          if (!user?.companyId) return;
          this.auditService.log({
            companyId: user.companyId,
            userId: user.id,
            action: `${method}_FAILED`,
            resource: `${context.getClass().name}.${context.getHandler().name}`,
            resourceId: request.params?.id,
            details: {
              status: 'FAILED',
              durationMs: Date.now() - start,
              body: sanitize(request.body),
              params: request.params,
              query: request.query,
              error: error?.message || 'Error desconocido',
              statusCode: error?.status,
            },
          });
        },
      }),
    );
  }
}