
import { IsNotEmpty, IsString, IsOptional, IsUUID, IsEnum, IsNumber } from "class-validator";
import { AddendumType } from "../entities/addendum.entity";
export class CreateAddendumDto {
  @IsNotEmpty()
  @IsUUID()
  contractId!: string;

  @IsNotEmpty()
  @IsEnum(AddendumType)
  tipo!: AddendumType;

  @IsNotEmpty()
  @IsString()
  descripcion!: string;

  @IsOptional()
  @IsString()
  montoAdicional?: string;

  @IsOptional()
  @IsNumber()
  diasAdicionales?: number;
}
