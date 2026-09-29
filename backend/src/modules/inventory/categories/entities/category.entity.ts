import { BaseTenantEntity } from "@/infrastructure/database/base-tenant.entity";
import { Column, Entity, Index } from "typeorm";

@Entity('inventory_categories')
@Index(['companyId', 'name'], { unique: true })
export class Category extends BaseTenantEntity {
  @Column({ length: 100 })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;
}