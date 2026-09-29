import { BaseTenantEntity } from "@/infrastructure/database/base-tenant.entity";
import { Column, Entity, Index } from "typeorm";

@Entity("documents_categories")
@Index(["companyId", "name"], { unique: true })
export class Category extends BaseTenantEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;
}
  