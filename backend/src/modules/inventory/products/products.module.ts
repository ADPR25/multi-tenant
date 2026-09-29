import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "./entities/product.entity";
import { Brand } from "../brands/entities/brand.entity";
import { Category } from "../categories/entities/category.entity";
import { Uom } from "../uom/entities/uom.entity";
import { Warehouse } from "../warehouses/entities/warehouse.entity";
import { Stock } from "../stocks/entities/stock.entity";
import { ProductsService } from "./products.service";
import { ProductsController } from "./products.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Product, Brand, Category, Uom, Warehouse, Stock])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}