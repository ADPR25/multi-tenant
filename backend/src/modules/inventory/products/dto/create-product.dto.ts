import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateProductDto {
  @IsNotEmpty() @IsString() sku: string;
  @IsNotEmpty() @IsString() name: string;
  @IsOptional() @IsString() description?: string;

  @IsOptional() @IsUUID() brandId?: string;
  @IsOptional() @IsUUID() categoryId?: string;

  @IsNotEmpty() @IsUUID() uomId: string;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  cost: number;
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  price: number;
  @IsNotEmpty() @IsNumber() @Type(() => Number) min_stock: number;
}
