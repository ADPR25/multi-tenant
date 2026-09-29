import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsPositive,
  ValidateIf,
} from "class-validator";
import { Type } from "class-transformer";
import { MovementType } from "../entities/stock-movement.entity";

export class CreateStockMovementDto {
  @IsNotEmpty() @IsUUID() productId: string;
  @IsNotEmpty() @IsUUID() warehouseId: string;
  @IsNotEmpty() @IsEnum(MovementType) type: MovementType;
  @IsNotEmpty() @IsNumber() @IsPositive() @Type(() => Number) quantity: number;
  @IsNotEmpty() @IsString() reason: string;
  @IsOptional() @IsUUID() referenceId?: string;

  @ValidateIf((o) => o.type === MovementType.TRANSFER_OUT)
  @IsNotEmpty({ message: "toWarehouseId es obligatorio para TRANSFER_OUT" })
  @IsUUID()
  toWarehouseId?: string;
}
