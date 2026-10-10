import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsUUID } from "class-validator";

export class CreateRequirementDto {
  @IsNotEmpty()
  @IsUUID()
  contractId!: string;

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @IsOptional()
  @IsUUID()
  documentId?: string;

  @IsOptional()
  @IsString()
  observation?: string;
}