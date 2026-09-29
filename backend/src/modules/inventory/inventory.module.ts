import { Module } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";
import { BrandsModule } from "./brands/brands.module";
import { CategoriesModule } from "./categories/categories.module";
import { WarehousesModule } from "./warehouses/warehouses.module";
import { UomModule } from "./uom/uom.module";
import { ProductsModule } from "./products/products.module";

@Module({
  imports: [
    BrandsModule,
    CategoriesModule,
    WarehousesModule,
    UomModule,
    ProductsModule,
  ],
  exports: [
    BrandsModule,
    CategoriesModule,
    WarehousesModule,
    UomModule,
    ProductsModule,
  ],
})
export class InventoryModule {}
