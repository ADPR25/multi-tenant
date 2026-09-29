import { BaseTenantEntity } from "@/infrastructure/database/base-tenant.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from "typeorm";
import { Brand } from "../../brands/entities/brand.entity";
import { Category } from "../../categories/entities/category.entity";
import { Uom } from "../../uom/entities/uom.entity";

@Entity("inventory_products")
@Unique(["companyId", "sku"])
@Index(["companyId", "name"])
export class Product extends BaseTenantEntity {
  @Column() sku: string;
  @Column() name: string;
  @Column({ nullable: true }) description: string;
  @Column({ nullable: true }) barcode: string;

  @Index()
  @Column({ name: "brand_id", type: "uuid", nullable: true })
  brandId: string | null;
  @ManyToOne(() => Brand, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "brand_id" })
  brand: Brand;

  @Index()
  @Column({ name: "category_id", type: "uuid", nullable: true })
  categoryId: string | null;
  @ManyToOne(() => Category, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "category_id" })
  category: Category;

  @Index()
  @Column({ name: "uom_id", type: "uuid" })
  uomId: string;
  @ManyToOne(() => Uom, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "uom_id" })
  uom: Uom;

  @Column({ type: "decimal", precision: 12, scale: 2 }) cost: number;
  @Column({ type: "decimal", precision: 12, scale: 2 }) price: number;
  @Column({
    name: "min_stock",
    type: "decimal",
    precision: 12,
    scale: 2,
    default: 0,
  })
  min_stock: number;
  @Column({ default: true }) isActive: boolean;
}
