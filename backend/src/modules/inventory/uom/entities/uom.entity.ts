import { BaseTenantEntity } from "@/infrastructure/database/base-tenant.entity";
import { Column, Entity } from "typeorm";

@Entity("uom")
export class Uom extends BaseTenantEntity {
  @Column()
  name: string;

  @Column()
  short_name: string;

  @Column({ default: true })
  isActive: boolean;
}
