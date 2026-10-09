
import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsUUID } from "class-validator";
export class CreateRequirementDto {
  @IsNotEmpty()
  @IsUUID()
  contractId!: string;

  @IsNotEmpty()
  @IsString()
  nombre!: string;

  @IsOptional()
  @IsBoolean()
  obligatorio?: boolean;

  @IsOptional()
  @IsUUID()
  documentId?: string;

  @IsOptional()
  @IsString()
  observacion?: string;
}
