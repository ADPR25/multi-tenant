import { Injectable, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository, DataSource } from "typeorm";
import { RoleMenu } from "./entities/role-menu.entity";
import { Permission } from "@/core/iam/permissions/entities/permission.entity";
import { RolePermission } from "@/core/iam/role-permissions/entities/role-permission.entity";
import {
  ACCESS_CATALOG,
  DEFAULT_SIDEBAR,
  DEFAULT_ROUTES,
  CatalogModule,
  CatalogRoute,
} from "./data/access.catalog";
import { SUPER_ADMIN_SIDEBAR, SUPER_ADMIN_ROUTES } from "./data/super.admin";
import { SidebarItem, RouteItem } from "./dto/save-role-menus.dto";

@Injectable()
export class FrontendService {
  constructor(
    @InjectRepository(RoleMenu)
    private readonly roleMenuRepo: Repository<RoleMenu>,
    @InjectRepository(Permission)
    private readonly permRepo: Repository<Permission>,
    @InjectRepository(RolePermission)
    private readonly rolePermRepo: Repository<RolePermission>,
    private readonly dataSource: DataSource,
  ) {}

  getRaw() {
    return DEFAULT_SIDEBAR;
  }
  getRoutesRaw() {
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
    source: any[] = DEFAULT_SIDEBAR,
  ): any[] {
    return source
      .map((group) => {
        if (group.children) {
          const filteredChildren = group.children.filter((c: any) =>
            allowedPaths.has(c.path),
          );
          return filteredChildren.length
            ? { ...group, children: filteredChildren }
            : null;
        }
        return group.path && allowedPaths.has(group.path) ? group : null;
      })
      .filter(Boolean);
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

  private async ensurePermissionsSeeded(companyId: string): Promise<void> {
    const allNames = [
      ...new Set(
        ACCESS_CATALOG.flatMap((mod: CatalogModule) => {
          const routes: CatalogRoute[] = (mod.children as CatalogRoute[]) ?? [];
          return routes.length
            ? routes.flatMap((r) => r.permissions ?? [])
            : (mod.permissions ?? []);
        }),
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

  async getForRole(roleId: string, roleCode: string, companyId: string) {
    if (this.isSuper(roleCode)) return SUPER_ADMIN_SIDEBAR;
    const custom = await this.roleMenuRepo.findOne({
      where: { roleId, companyId },
    });
    if (!custom?.sidebar?.length) return [];
    const allowedPaths = new Set(
      this.flattenSidebar(custom.sidebar as any).map((s) => s.path),
    );
    return this.filterSidebarByPaths(allowedPaths);
  }

  async getRoutesForRole(roleId: string, roleCode: string, companyId: string) {
    if (this.isSuper(roleCode)) return SUPER_ADMIN_ROUTES;
    const custom = await this.roleMenuRepo.findOne({
      where: { roleId, companyId },
    });
    return custom?.routes ?? [];
  }

  async getRawForRole(roleId: string, companyId: string) {
    return (
      (await this.roleMenuRepo.findOne({ where: { roleId, companyId } })) ?? {
        sidebar: [],
        routes: [],
        roleId,
      }
    );
  }

  async getAssignmentData(roleId: string, currentUser: any) {
    const companyId = currentUser.companyId;
    const roleCode = currentUser.roleCode || currentUser.code;
    await this.ensurePermissionsSeeded(companyId);

    const target = await this.roleMenuRepo.findOne({
      where: { roleId, companyId },
    });
    const rolePermissions = await this.rolePermRepo.find({
      where: { roleId, companyId },
    });

    if (this.isSuper(roleCode)) {
      const allPermissions = await this.permRepo.find({
        where: { companyId },
        order: { name: "ASC" },
      });
      return {
        catalog: [...ACCESS_CATALOG],
        allSidebar: DEFAULT_SIDEBAR,
        assignedSidebar: target?.sidebar ?? [],
        allRoutes: DEFAULT_ROUTES,
        assignedRoutes: target?.routes ?? [],
        allPermissions,
        assignedPermissions: rolePermissions.map((rp) => rp.permissionId),
        roleId,
      };
    }

    const myRoleMenu = await this.roleMenuRepo.findOne({
      where: { roleId: currentUser.roleId, companyId },
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

    const allowedMyPaths = new Set(
      this.flattenSidebar(myRoleMenu.sidebar as any).map((s) => s.path),
    );
    const allSidebar = this.filterSidebarByPaths(allowedMyPaths);
    const allRoutes = (DEFAULT_ROUTES as RouteItem[]).filter((r) =>
      allowedMyPaths.has(r.path),
    );
    const catalog = ACCESS_CATALOG.map((mod) => {
      if (mod.children) {
        const filtered = mod.children.filter((c) => allowedMyPaths.has(c.path));
        return filtered.length ? { ...mod, children: filtered } : null;
      }
      return mod.path && allowedMyPaths.has(mod.path) ? mod : null;
    }).filter((m): m is CatalogModule => m !== null);

    const myPerms = await this.rolePermRepo.find({
      where: { roleId: currentUser.roleId, companyId },
    });
    const allowedPermissionIds = new Set(myPerms.map((p) => p.permissionId));
    let allPermissions = await this.permRepo.find({
      where: { companyId },
      order: { name: "ASC" },
    });
    allPermissions = allPermissions.filter((p) =>
      allowedPermissionIds.has(p.id),
    );

    const filteredAssignedSidebar = this.filterSidebarByPaths(
      allowedMyPaths,
      (target?.sidebar as any[]) ?? [],
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
    currentUser: any,
    permissions?: string[],
  ) {
    const companyId = currentUser.companyId;
    const roleCode = currentUser.roleCode || currentUser.code;

    await this.ensurePermissionsSeeded(companyId);

    if (!this.isSuper(roleCode)) {
      const myRoleMenu = await this.roleMenuRepo.findOne({
        where: { roleId: currentUser.roleId, companyId },
      });
      const allowedMyPaths = new Set(
        this.flattenSidebar((myRoleMenu?.sidebar as any) ?? []).map(
          (s) => s.path,
        ),
      );
      if (sidebar.length === 0 && allowedMyPaths.size === 0) {
      } else if (
        this.flattenSidebar(sidebar).some((s) => !allowedMyPaths.has(s.path))
      ) {
        throw new ForbiddenException(
          "No puedes asignar módulos que tú no tienes",
        );
      }
      if (permissions?.length) {
        const myPerms = await this.rolePermRepo.find({
          where: { roleId: currentUser.roleId, companyId },
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

    return await this.dataSource.transaction(async (manager) => {
      let existing = await manager.findOne(RoleMenu, {
        where: { roleId, companyId },
      });
      if (!existing) {
        existing = manager.create(RoleMenu, {
          roleId,
          sidebar,
          routes: autoRoutes,
          companyId,
        } as any);
      } else {
        existing.sidebar = sidebar as any;
        existing.routes = autoRoutes as any;
      }
      await manager.save(existing);

      if (permissions !== undefined) {
        await manager.delete(RolePermission, { roleId, companyId });
        if (permissions.length > 0) {
          const entities = manager.create(
            RolePermission,
            permissions.map((permissionId) => ({
              roleId,
              permissionId,
              companyId,
            })),
          );
          await manager.save(entities);
        }
      }
      return existing;
    });
  }
}
