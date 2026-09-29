import { Module } from "@nestjs/common";
import { BrandsModule } from "./brands/brands.module";
import { CategoriesModule } from "./categories/categories.module";
import { ProductsModule } from "./products/products.module";
import { StockMovementsModule } from "./stock-movements/stock-movements.module";
import { StocksModule } from "./stocks/stocks.module";
import { UomModule } from "./uom/uom.module";
import { WarehousesModule } from "./warehouses/warehouses.module";

@Module({
  imports: [
    BrandsModule,
    CategoriesModule,
    WarehousesModule,
    UomModule,
    ProductsModule,
    StocksModule,
    StockMovementsModule,
  ],
  exports: [
    BrandsModule,
    CategoriesModule,
    WarehousesModule,
    UomModule,
    ProductsModule,
    StocksModule,
    StockMovementsModule,
  ],
})
export class InventoryModule {}
