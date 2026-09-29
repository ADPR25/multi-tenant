import { BaseTenantEntity } from "@/infrastructure/database/base-tenant.entity";
import { Column, Entity } from "typeorm";

@Entity('inventory_categories')
export class Category extends BaseTenantEntity {
  @Column({ length: 100 })
  name: string;

  @Column()
  description: string;

  @Column({ default: true })
  isActive: boolean;
}
