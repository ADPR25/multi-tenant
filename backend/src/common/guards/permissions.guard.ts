import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { DataSource } from "typeorm";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { RolePermission } from "@/core/iam/role-permissions/entities/role-permission.entity";
import { Role } from "@/core/iam/roles/entities/role.entity";
import { PERMISSIONS_KEY } from "@/common/decorators/permissions.decorator";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private dataSource: DataSource,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const required = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required?.length) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user?.roleId) throw new ForbiddenException("Sin rol asignado");
    if (user.roleCode === "SUPER_ADMIN" || user.code === "SUPER_ADMIN")
      return true;

    const cacheKey = `perms:${user.companyId}:${user.roleId}`;
    let perms: RolePermission[] | undefined =
      await this.cacheManager.get(cacheKey);

    if (!perms) {
      const role = await this.dataSource
        .getRepository(Role)
        .findOne({ where: { id: user.roleId } });
      if (role?.code === "SUPER_ADMIN") return true;

      perms = await this.dataSource.getRepository(RolePermission).find({
        where: { companyId: user.companyId, roleId: user.roleId },
        relations: { permission: true },
      });
      await this.cacheManager.set(cacheKey, perms, 120);
    }

    const userPermissionNames = new Set(perms.map((p) => p.permission?.name));

    for (const req of required) {
      if (!userPermissionNames.has(req)) {
        throw new ForbiddenException(`Falta permiso: ${req}`);
      }
    }
    return true;
  }
}
