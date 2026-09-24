import { BaseTenantEntity } from "@/infrastructure/database/base-tenant.entity";
import { Column } from "typeorm";

export class Category extends BaseTenantEntity {
  @Column({ length: 100 })
  name: string;

  @Column()
  description: string;

  @Column({ default: true })
  isActive: boolean;
}
