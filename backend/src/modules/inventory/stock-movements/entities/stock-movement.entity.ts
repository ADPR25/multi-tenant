import { BaseTenantEntity } from "@/infrastructure/database/base-tenant.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Product } from "../../products/entities/product.entity";
import { Warehouse } from "../../warehouses/entities/warehouse.entity";

export enum MovementType {
  IN = "IN",
  OUT = "OUT",
  ADJUSTMENT = "ADJUSTMENT",
  TRANSFER_IN = "TRANSFER_IN",
  TRANSFER_OUT = "TRANSFER_OUT",
}

@Entity("inventory_stock_movements")
@Index(["companyId", "productId", "warehouseId"])
@Index(["companyId", "createdAt"])
export class StockMovement extends BaseTenantEntity {
  @Index() @Column({ name: "product_id", type: "uuid" }) productId: string;
  @ManyToOne(() => Product, { onDelete: "CASCADE" })
  @JoinColumn({ name: "product_id" })
  product: Product;

  @Index() @Column({ name: "warehouse_id", type: "uuid" }) warehouseId: string;
  @ManyToOne(() => Warehouse, { onDelete: "CASCADE" })
  @JoinColumn({ name: "warehouse_id" })
  warehouse: Warehouse;

  @Column({ type: "enum", enum: MovementType }) type: MovementType;
  @Column({ type: "decimal", precision: 12, scale: 2 }) quantity: number;
  @Column({
    name: "previous_quantity",
    type: "decimal",
    precision: 12,
    scale: 2,
  })
  previousQuantity: number;
  @Column({ name: "new_quantity", type: "decimal", precision: 12, scale: 2 })
  newQuantity: number;
  @Column() reason: string;
  @Column({ name: "reference_id", type: "uuid", nullable: true })
  referenceId: string;
  @Column({ name: "to_warehouse_id", type: "uuid", nullable: true })
  toWarehouseId: string | null;

  @ManyToOne(() => Warehouse, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "to_warehouse_id" })
  toWarehouse: Warehouse | null;
}
