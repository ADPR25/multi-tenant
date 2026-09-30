import { BaseTenantEntity } from "@/infrastructure/database/base-tenant.entity";
import { Column, Entity, Index } from "typeorm";

@Entity("inventory_brands")
@Index(["companyId", "name"], { unique: true })
export class Brand extends BaseTenantEntity {
  @Column({ length: 100 })
  name: string;

  @Column({ default: "" })
  description: string;

  @Column({ default: true })
  isActive: boolean;
}
