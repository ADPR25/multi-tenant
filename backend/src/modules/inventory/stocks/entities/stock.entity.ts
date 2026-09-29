import { BaseTenantEntity } from "@/infrastructure/database/base-tenant.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from "typeorm";
import { Product } from "../../products/entities/product.entity";
import { Warehouse } from "../../warehouses/entities/warehouse.entity";

@Entity("inventory_stocks")
@Unique(["companyId", "productId", "warehouseId"])
@Index(["companyId", "productId"])
@Index(["companyId", "warehouseId"])
export class Stock extends BaseTenantEntity {
  @Index() @Column({ name: "product_id", type: "uuid" }) productId: string;
  @ManyToOne(() => Product, { onDelete: "CASCADE" })
  @JoinColumn({ name: "product_id" })
  product: Product;

  @Index() @Column({ name: "warehouse_id", type: "uuid" }) warehouseId: string;
  @ManyToOne(() => Warehouse, { onDelete: "CASCADE" })
  @JoinColumn({ name: "warehouse_id" })
  warehouse: Warehouse;

  @Column({ type: "decimal", precision: 12, scale: 2, default: 0 })
  quantity: number;
}
