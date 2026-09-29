import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StockMovement } from "./entities/stock-movement.entity";
import { Stock } from "../stocks/entities/stock.entity";
import { StockMovementsService } from "./stock-movements.service";
import { StockMovementsController } from "./stock-movements.controller";

@Module({
  imports: [TypeOrmModule.forFeature([StockMovement, Stock])],
  controllers: [StockMovementsController],
  providers: [StockMovementsService],
  exports: [StockMovementsService],
})
export class StockMovementsModule {}
