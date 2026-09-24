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

type Action = "create" | "read" | "update" | "delete";

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
    if (!required || required.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user?.roleId) throw new ForbiddenException("Sin rol asignado");
    if (!user?.companyId) throw new ForbiddenException("Sin empresa");
    if (user.roleCode === "SUPER_ADMIN" || user.code === "SUPER_ADMIN")
      return true;

    // FIX: Validación de companies:create fuera del loop
    if (required.includes("companies:create")) {
      throw new ForbiddenException("Solo SUPER_ADMIN puede crear empresas");
    }

    const cacheKey = `perms:${user.companyId}:${user.roleId}`;
    let perms: RolePermission[] | undefined =
      await this.cacheManager.get(cacheKey);

    if (!perms) {
      const roleRepo = this.dataSource.getRepository(Role);
      const rpRepo = this.dataSource.getRepository(RolePermission);
      const role = await roleRepo.findOne({ where: { id: user.roleId } });
      if (role && role.code === "SUPER_ADMIN") return true;
      perms = await rpRepo.find({
        where: { companyId: user.companyId, roleId: user.roleId },
        relations: { permission: true },
      });
      await this.cacheManager.set(cacheKey, perms, 120);
    }

    for (const req of required) {
      const lastColon = req.lastIndexOf(":");
      let resource: string;
      let action: Action | undefined;
      if (lastColon === -1) {
        resource = req;
      } else {
        resource = req.substring(0, lastColon);
        action = req.substring(lastColon + 1) as Action;
      }
      const match = perms.find(
        (p) => p.permission && p.permission.name === resource,
      );
      if (!match) throw new ForbiddenException(`Falta permiso: ${req}`);
      if (action) {
        const map: Record<Action, keyof RolePermission> = {
          create: "canCreate",
          read: "canRead",
          update: "canUpdate",
          delete: "canDelete",
        };
        const field = map[action];
        if (field && !match[field]) {
          throw new ForbiddenException(`Falta permiso: ${req}`);
        }
      }
    }
    return true;
  }
}
