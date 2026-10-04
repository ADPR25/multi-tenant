import { BaseTenantEntity } from "@/infrastructure/database/base-tenant.entity";
import { Column, Entity, Index } from "typeorm";

@Entity("inventory_warehouses")
@Index(["companyId", "code"], { unique: true })
export class Warehouse extends BaseTenantEntity {
  @Column()
  name: string;

  @Column({ length: 50 })
  code: string;

  @Column({ nullable: true })
  address: string;

  @Column({ default: true })
  isActive: boolean;
}
