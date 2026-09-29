import { BaseTenantEntity } from "@/infrastructure/database/base-tenant.entity";
import { Column, Entity } from "typeorm";

@Entity('inventory_products')
export class Product extends BaseTenantEntity {
  @Column()
  sku: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  cost: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: number;

  @Column({ name: 'min_stock' })
  min_stock: number;

  @Column({ default: true })
  isActive: boolean;
}