import { BaseTenantEntity } from "@/infrastructure/database/base-tenant.entity";
import { Column, Entity } from "typeorm";

@Entity('inventory_brands')
export class Brand extends BaseTenantEntity {
  @Column({ length: 100 })
  name: string;

  @Column({ default: true })
  isActive: boolean;
}
