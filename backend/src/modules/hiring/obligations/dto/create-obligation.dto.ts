
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsUUID } from "class-validator";

export class CreateObligationDto {
  @IsNotEmpty()
  @IsUUID()
  contractId!: string;

  @IsNotEmpty()
  @IsString()
  descripcion!: string;

  @IsOptional()
  @IsNumber()
  orden?: number;
}
