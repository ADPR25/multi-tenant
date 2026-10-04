import { BaseTenantEntity } from "@/infrastructure/database/base-tenant.entity";
import { Column, Entity, Index } from "typeorm";

@Entity("inventory_uom")
@Index(["companyId", "name"], { unique: true })
@Index(["companyId", "short_name"], { unique: true })
export class Uom extends BaseTenantEntity {
  @Column()
  name: string;

  @Column()
  short_name: string;

  @Column({ default: true })
  isActive: boolean;
}
