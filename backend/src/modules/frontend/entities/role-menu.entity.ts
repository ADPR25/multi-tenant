import { Entity, Column, ManyToOne, JoinColumn, Index } from "typeorm";
import { BaseTenantEntity } from "@/infrastructure/database/base-tenant.entity";
import { Role } from "@/core/iam/roles/entities/role.entity";
import { RouteItem, SidebarItem } from "../dto/save-role-menus.dto";

@Entity("role_menus")
@Index(["companyId", "roleId"], { unique: true })
export class RoleMenu extends BaseTenantEntity {
  @Column({ type: "uuid" })
  roleId: string;

  @ManyToOne(() => Role, { onDelete: "CASCADE" })
  @JoinColumn({ name: "roleId" })
  role: Role;

  @Column({ type: "jsonb", default: [] })
  sidebar: SidebarItem[];

  @Column({ type: "jsonb", default: [] })
  routes: RouteItem[];
}
