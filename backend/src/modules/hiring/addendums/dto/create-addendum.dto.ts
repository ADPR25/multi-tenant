import { IsNotEmpty, IsString, IsOptional, IsUUID, IsEnum, IsNumber } from "class-validator";
import { AddendumType } from "../entities/addendum.entity";

export class CreateAddendumDto {
  @IsNotEmpty()
  @IsUUID()
  contractId!: string;

  @IsNotEmpty()
  @IsEnum(AddendumType)
  type!: AddendumType;

  @IsNotEmpty()
  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  additionalAmount?: string;

  @IsOptional()
  @IsNumber()
  additionalDays?: number;
}