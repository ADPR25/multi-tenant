import { Entity, Column, ManyToOne, JoinColumn, Unique, Index } from "typeorm";
import { Permission } from "../../permissions/entities/permission.entity";
import { Role } from "../../roles/entities/role.entity";
import { BaseTenantEntity } from "@/infrastructure/database/base-tenant.entity";

@Entity("role_permissions")
@Unique(["companyId", "roleId", "permissionId"])
@Index(["companyId", "roleId"])
export class RolePermission extends BaseTenantEntity {
  @Column({ type: "uuid" }) 
  roleId: string;

  @ManyToOne(() => Role, { onDelete: "CASCADE" })
  @JoinColumn({ name: "roleId" })
  role: Role;

  @Column({ type: "uuid" }) 
  permissionId: string;

  @ManyToOne(() => Permission, { onDelete: "CASCADE" })
  @JoinColumn({ name: "permissionId" })
  permission: Permission;

  @Column({ default: false }) 
  canCreate: boolean;
  
  @Column({ default: false }) 
  canRead: boolean;

  @Column({ default: false }) 
  canUpdate: boolean;

  @Column({ default: false }) 
  canDelete: boolean;
}