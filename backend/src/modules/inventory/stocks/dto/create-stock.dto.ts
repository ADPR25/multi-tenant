import { IsNotEmpty, IsNumber, IsUUID } from "class-validator";
import { Type } from "class-transformer";

export class CreateStockDto {
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @IsNotEmpty()
  @IsUUID()
  warehouseId: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  quantity: number;
}
