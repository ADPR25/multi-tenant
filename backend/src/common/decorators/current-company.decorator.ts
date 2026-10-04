import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";

export interface CurrentUserPayload {
  id?: string;
  sub?: string;
  first_name?: string;
  last_name?: string;
  companyId?: string | null;
  roleId?: string;
  roleCode?: string;
  code?: string;
  role?: { code?: string };
}

interface RequestWithUser {
  user?: CurrentUserPayload;
}

export const CurrentCompanyId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) throw new UnauthorizedException("Usuario no autenticado");

    const isSuper =
      user.roleCode === "SUPER_ADMIN" ||
      user.code === "SUPER_ADMIN" ||
      user.role?.code === "SUPER_ADMIN";

    if (isSuper) {
      return user.companyId ?? null;
    }

    const companyId = user.companyId;
    if (!companyId) {
      throw new UnauthorizedException("companyId no presente en token");
    }
    return companyId;
  },
);

export const OptionalCompanyId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user?.companyId ?? null;
  },
);

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserPayload => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    if (!request.user) {
      throw new UnauthorizedException("Usuario no autenticado");
    }
    return request.user;
  },
);
