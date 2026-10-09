import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository, DataSource, IsNull, FindOptionsWhere } from "typeorm";
import { RoleMenu } from "./entities/role-menu.entity";
import { Permission } from "@/core/iam/permissions/entities/permission.entity";
import { RolePermission } from "@/core/iam/role-permissions/entities/role-permission.entity";
import { Role } from "@/core/iam/roles/entities/role.entity";
import {
  ACCESS_CATALOG,
  DEFAULT_SIDEBAR,
  DEFAULT_ROUTES,
  CatalogModule,
  CatalogRoute,
} from "./data/access.catalog";
import { SUPER_ADMIN_SIDEBAR, SUPER_ADMIN_ROUTES } from "./data/super.admin";
import { SidebarItem, RouteItem } from "./dto/save-role-menus.dto";
import { CurrentUserPayload } from "@/common/decorators/current-company.decorator";

type RoleMenuWhere = FindOptionsWhere<RoleMenu>;

@Injectable()
export class FrontendService {
  constructor(
    @InjectRepository(RoleMenu)
    private readonly roleMenuRepo: Repository<RoleMenu>,
    @InjectRepository(Permission)
    private readonly permRepo: Repository<Permission>,
    @InjectRepository(RolePermission)
    private readonly rolePermRepo: Repository<RolePermission>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    private readonly dataSource: DataSource,
  ) {}

  getRaw(): SidebarItem[] {
    return DEFAULT_SIDEBAR;
  }

  getRoutesRaw(): RouteItem[] {
    return DEFAULT_ROUTES;
  }

  private isSuper(roleCode?: string): boolean {
    return roleCode === "SUPER_ADMIN";
  }

  private flattenSidebar(items: SidebarItem[]): SidebarItem[] {
    const flat: SidebarItem[] = [];
    const walk = (nodes: SidebarItem[]) => {
      for (const node of nodes) {
        if (node.children?.length) walk(node.children);
        else flat.push(node);
      }
    };
    walk(items);
    return flat;
  }

  private filterSidebarByPaths(
    allowedPaths: Set<string>,
    source: SidebarItem[] = DEFAULT_SIDEBAR,
  ): SidebarItem[] {
    return source
      .map((group) => {
        if (group.children) {
          const filteredChildren = group.children.filter((c) =>
            allowedPaths.has(c.path),
          );
          return filteredChildren.length
            ? { ...group, children: filteredChildren }
            : null;
        }
        return group.path && allowedPaths.has(group.path) ? group : null;
      })
      .filter((g): g is SidebarItem => g !== null);
  }

  private resolveRoutesFromSidebar(
    selectedSidebar: SidebarItem[],
  ): RouteItem[] {
    const flat = this.flattenSidebar(selectedSidebar);
    const selectedPaths = new Set(flat.map((s) => s.path));
    return (DEFAULT_ROUTES as RouteItem[]).filter((r) =>
      selectedPaths.has(r.path),
    );
  }

  private buildWhere(roleId: string, companyId: string | null): RoleMenuWhere {
    if (companyId) return { roleId, companyId };
    return { roleId, companyId: IsNull() };
  }

  private async ensurePermissionsSeeded(
    companyId: string | null,
  ): Promise<void> {
    if (!companyId) return;
    const allNames = [
      ...new Set(
        ACCESS_CATALOG.flatMap((mod: CatalogModule) => {
          const routes: CatalogRoute[] = mod.children ?? [];
          return routes.length
            ? routes.flatMap((r) => r.permissions ?? [])
            : (mod.permissions ?? []);
        }).filter((n) => !!n), 
      ),
    ];
    if (!allNames.length) return;

    const existing = await this.permRepo.find({
      where: { name: In(allNames), companyId },
    });
    const existingNames = new Set(existing.map((p) => p.name));
    const missing = allNames.filter((n) => !existingNames.has(n));
    if (missing.length) {
      await this.permRepo.save(
        missing.map((name) =>
          this.permRepo.create({
            name,
            module: name.split(":")[0],
            description: `${name}`,
            companyId,
          }),
        ),
      );
    }
  }

  private getCatalogForPermissions(
    source: CatalogModule[] = ACCESS_CATALOG,
  ): CatalogModule[] {
    return source
      .map((mod) => {
        if (!mod.children) {
          return mod.permissions?.length ? mod : null;
        }
        const withPerms = mod.children.filter((c) => c.permissions?.length);
        return withPerms.length ? { ...mod, children: withPerms } : null;
      })
      .filter((m): m is CatalogModule => m !== null);
  }

  async getForRole(
    roleId: string,
    roleCode: string,
    companyId: string | null,
  ): Promise<SidebarItem[]> {
    if (this.isSuper(roleCode)) return SUPER_ADMIN_SIDEBAR as SidebarItem[];
    const custom = await this.roleMenuRepo.findOne({
      where: this.buildWhere(roleId, companyId),
    });
    if (!custom?.sidebar?.length) return [];
    const sidebar = custom.sidebar;
    const allowedPaths = new Set(
      this.flattenSidebar(sidebar).map((s) => s.path),
    );
    return this.filterSidebarByPaths(allowedPaths);
  }

  async getRoutesForRole(
    roleId: string,
    roleCode: string,
    companyId: string | null,
  ): Promise<RouteItem[]> {
    if (this.isSuper(roleCode)) return SUPER_ADMIN_ROUTES;
    const custom = await this.roleMenuRepo.findOne({
      where: this.buildWhere(roleId, companyId),
    });
    return custom?.routes ?? [];
  }

  async getRawForRole(roleId: string, companyId: string | null) {
    return (
      (await this.roleMenuRepo.findOne({
        where: this.buildWhere(roleId, companyId),
      })) ?? {
        sidebar: [] as SidebarItem[],
        routes: [] as RouteItem[],
        roleId,
      }
    );
  }

  async getAssignmentData(roleId: string, currentUser: CurrentUserPayload) {
    const currentRoleCode = currentUser.roleCode ?? currentUser.code;
    const isCurrentSuper = this.isSuper(currentRoleCode);

    const targetRole = await this.roleRepo.findOne({ where: { id: roleId } });
    if (!targetRole) throw new NotFoundException("Rol no encontrado");

    const targetCompanyId = targetRole.companyId ?? null;

    if (targetRole.code === "SUPER_ADMIN" && !targetCompanyId) {
      return {
        catalog: this.getCatalogForPermissions([...ACCESS_CATALOG]),
        allSidebar: DEFAULT_SIDEBAR,
        assignedSidebar: SUPER_ADMIN_SIDEBAR,
        allRoutes: DEFAULT_ROUTES,
        assignedRoutes: SUPER_ADMIN_ROUTES,
        allPermissions: [],
        assignedPermissions: [],
        roleId,
      };
    }

    await this.ensurePermissionsSeeded(targetCompanyId);

    const targetWhere = this.buildWhere(roleId, targetCompanyId);
    const target = await this.roleMenuRepo.findOne({ where: targetWhere });
    const rolePermissions = await this.rolePermRepo.find({
      where: { roleId, companyId: targetCompanyId ?? undefined },
    });

    if (isCurrentSuper) {
      const allPermissions = await this.permRepo.find({
        where: { companyId: targetCompanyId ?? undefined },
        order: { name: "ASC" },
      });
      return {
        catalog: this.getCatalogForPermissions([...ACCESS_CATALOG]),
        allSidebar: DEFAULT_SIDEBAR,
        assignedSidebar: target?.sidebar ?? [],
        allRoutes: DEFAULT_ROUTES,
        assignedRoutes: target?.routes ?? [],
        allPermissions,
        assignedPermissions: rolePermissions.map((rp) => rp.permissionId),
        roleId,
      };
    }

    const myCompanyId = currentUser.companyId ?? null;
    const myRoleMenu = await this.roleMenuRepo.findOne({
      where: this.buildWhere(currentUser.roleId, myCompanyId),
    });

    if (!myRoleMenu?.sidebar?.length) {
      return {
        catalog: [],
        allSidebar: [],
        assignedSidebar: target?.sidebar ?? [],
        allRoutes: [],
        assignedRoutes: target?.routes ?? [],
        allPermissions: [],
        assignedPermissions: rolePermissions.map((rp) => rp.permissionId),
        roleId,
      };
    }

    const mySidebar = myRoleMenu.sidebar;
    const allowedMyPaths = new Set(
      this.flattenSidebar(mySidebar).map((s) => s.path),
    );
    const allSidebar = this.filterSidebarByPaths(allowedMyPaths);
    const allRoutes = (DEFAULT_ROUTES as RouteItem[]).filter((r) =>
      allowedMyPaths.has(r.path),
    );

    const filteredAccessCatalog = ACCESS_CATALOG.map((mod) => {
      if (mod.children) {
        const filtered = mod.children.filter((c) => allowedMyPaths.has(c.path));
        return filtered.length ? { ...mod, children: filtered } : null;
      }
      return mod.path && allowedMyPaths.has(mod.path) ? mod : null;
    }).filter((m): m is CatalogModule => m !== null);

    const catalog = this.getCatalogForPermissions(filteredAccessCatalog);

    const myPerms = await this.rolePermRepo.find({
      where: {
        roleId: currentUser.roleId,
        companyId: myCompanyId ?? undefined,
      },
    });
    const allowedPermissionIds = new Set(myPerms.map((p) => p.permissionId));
    const allPermissionsRaw = await this.permRepo.find({
      where: { companyId: myCompanyId ?? undefined },
      order: { name: "ASC" },
    });
    const allPermissions = allPermissionsRaw.filter((p) =>
      allowedPermissionIds.has(p.id),
    );

    const filteredAssignedSidebar = this.filterSidebarByPaths(
      allowedMyPaths,
      target?.sidebar ?? [],
    );

    return {
      catalog,
      allSidebar,
      assignedSidebar: filteredAssignedSidebar,
      allRoutes,
      assignedRoutes: target?.routes ?? [],
      allPermissions,
      assignedPermissions: rolePermissions.map((rp) => rp.permissionId),
      roleId,
    };
  }

  async saveForRole(
    roleId: string,
    sidebar: SidebarItem[],
    currentUser: CurrentUserPayload,
    permissions?: string[],
  ) {
    const currentRoleCode = currentUser.roleCode ?? currentUser.code;
    const isCurrentSuper = this.isSuper(currentRoleCode);

    const targetRole = await this.roleRepo.findOne({ where: { id: roleId } });
    if (!targetRole) throw new NotFoundException("Rol no encontrado");
    const targetCompanyId = targetRole.companyId ?? null;

    if (targetRole.code === "SUPER_ADMIN" && !targetCompanyId) {
      throw new ForbiddenException(
        "No puedes modificar el rol SUPER_ADMIN global",
      );
    }

    await this.ensurePermissionsSeeded(targetCompanyId);

    if (!isCurrentSuper) {
      const myRoleMenu = await this.roleMenuRepo.findOne({
        where: this.buildWhere(
          currentUser.roleId,
          currentUser.companyId ?? null,
        ),
      });
      const allowedMyPaths = new Set(
        this.flattenSidebar(myRoleMenu?.sidebar ?? []).map((s) => s.path),
      );
      if (
        this.flattenSidebar(sidebar).some((s) => !allowedMyPaths.has(s.path))
      ) {
        throw new ForbiddenException(
          "No puedes asignar módulos que tú no tienes",
        );
      }
      if (permissions?.length) {
        const myPerms = await this.rolePermRepo.find({
          where: {
            roleId: currentUser.roleId,
            companyId: currentUser.companyId ?? undefined,
          },
        });
        const allowedIds = new Set(myPerms.map((p) => p.permissionId));
        if (permissions.some((id) => !allowedIds.has(id))) {
          throw new ForbiddenException(
            "No puedes asignar permisos que tú no tienes",
          );
        }
      }
    }

    const autoRoutes = this.resolveRoutesFromSidebar(sidebar);

    return this.dataSource.transaction(async (manager) => {
      const where = this.buildWhere(roleId, targetCompanyId);
      let existing = await manager.findOne(RoleMenu, { where });
      if (!existing) {
        existing = manager.create(RoleMenu, {
          roleId,
          sidebar,
          routes: autoRoutes,
          companyId: targetCompanyId,
        } as FindOptionsWhere<RoleMenu> as never);
      } else {
        existing.sidebar = sidebar;
        existing.routes = autoRoutes;
      }
      await manager.save(existing);

      if (permissions !== undefined) {
        await manager.delete(RolePermission, {
          roleId,
          companyId: targetCompanyId ?? undefined,
        });
        if (permissions.length > 0) {
          const entities = manager.create(
            RolePermission,
            permissions.map((permissionId) => ({
              roleId,
              permissionId,
              companyId: targetCompanyId,
            })),
          );
          await manager.save(entities);
        }
      }
      return existing;
    });
  }
}
