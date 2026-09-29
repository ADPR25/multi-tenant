import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Stock } from "./entities/stock.entity";
import { Product } from "../products/entities/product.entity";
import { Warehouse } from "../warehouses/entities/warehouse.entity";
import { StocksService } from "./stocks.service";
import { StocksController } from "./stocks.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Stock, Product, Warehouse])],
  controllers: [StocksController],
  providers: [StocksService],
  exports: [StocksService],
})
export class StocksModule {}
