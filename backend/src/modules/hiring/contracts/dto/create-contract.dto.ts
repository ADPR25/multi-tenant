import { IsNotEmpty, IsOptional, IsString, IsUUID, IsNumberString, IsDateString, IsInt } from "class-validator";

export class CreateContractDto {
  @IsNotEmpty()
  @IsString()
  codigo!: string;

  @IsOptional()
  @IsString()
  numeroContrato?: string;

  @IsNotEmpty()
  @IsUUID()
  thirdPartyId!: string;

  @IsOptional()
  @IsUUID()
  supervisorId?: string;

  @IsNotEmpty()
  @IsString()
  objeto!: string;

  @IsOptional()
  @IsString()
  observacion?: string;

  @IsNotEmpty()
  @IsNumberString()
  montoTotal!: string;

  @IsOptional()
  @IsNumberString()
  montoPrimerPago?: string;

  @IsOptional()
  @IsInt()
  vecesPagadas?: number;

  @IsNotEmpty()
  @IsDateString()
  fechaInicio!: string;

  @IsOptional()
  @IsDateString()
  fechaCierre?: string;

  @IsOptional()
  @IsString()
  proyectoNombre?: string;

  @IsOptional()
  @IsUUID()
  proyectoId?: string;
}
