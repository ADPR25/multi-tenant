import { BaseTenantEntity } from "@/infrastructure/database/base-tenant.entity";
import { Entity, Column, Index } from "typeorm";

@Entity("permissions")
@Index(["companyId", "name"], { unique: true })
export class Permission extends BaseTenantEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: "general" })
  module: string;
}
