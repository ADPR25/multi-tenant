import { BaseTenantEntity } from "@/infrastructure/database/base-tenant.entity";
import { Column, Entity } from "typeorm";

@Entity('inventory_warehouses')
export class Warehouse extends BaseTenantEntity {
  @Column()
  name: string;

  @Column({ length: 50 })
  code: string;

  @Column()
  address: string;

  @Column({ default: true })
  isActive: boolean;
}
