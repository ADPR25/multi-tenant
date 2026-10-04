import { BaseTenantEntity } from "@/infrastructure/database/base-tenant.entity";
import { Entity, Column, Index } from "typeorm";

@Entity("roles")
@Index(["companyId", "code"], { unique: true })
@Index(["companyId", "name"], { unique: true })
export class Role extends BaseTenantEntity {
  @Column()
  name: string;

  @Column()
  code: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isPrincipal: boolean;
}
