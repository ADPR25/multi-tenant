import { Entity, Column, ManyToOne, JoinColumn, Index } from "typeorm";
import { Role } from "@/core/iam/roles/entities/role.entity";
import { BaseTenantEntity } from "@/infrastructure/database/base-tenant.entity";

@Entity("users")
@Index(["companyId", "document_number"], { unique: true })
@Index(["companyId", "email"], { unique: true })
export class User extends BaseTenantEntity {
  @Column()
  email!: string;

  @Column({ length: 25 })
  document_number!: string;

  @Column()
  first_name!: string;

  @Column()
  last_name!: string;

  @Column({ select: false })
  password!: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ name: "role_id", type: "uuid", nullable: true })
  roleId!: string | null;

  @ManyToOne(() => Role, { onDelete: "SET NULL" })
  @JoinColumn({ name: "role_id" })
  role?: Role;
}
