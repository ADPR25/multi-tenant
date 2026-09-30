import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";

export const CurrentCompanyId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) throw new UnauthorizedException("Usuario no autenticado");

    const isSuper =
      user.roleCode === "SUPER_ADMIN" ||
      user.code === "SUPER_ADMIN" ||
      user?.role?.code === "SUPER_ADMIN";

    if (isSuper) {
      return user.companyId || null;
    }

    const companyId = user.companyId;
    if (!companyId)
      throw new UnauthorizedException("companyId no presente en token");
    return companyId;
  },
);

export const OptionalCompanyId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.companyId || null;
  },
);

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (!request.user)
      throw new UnauthorizedException("Usuario no autenticado");
    return request.user;
  },
);
