import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateWarehouseDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  address: string;
}
