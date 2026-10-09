import { IsEnum, IsOptional, IsString, IsBoolean, IsNotEmpty, Length, IsEmail } from "class-validator";
import { ThirdPartyType } from "../enums/third-party-type.enum";
import { ThirdPartyPersonType } from "../enums/third-party-person-type.enum";

export class CreateThirdPartyDto {
  @IsNotEmpty()
  @IsString()
  @Length(5, 20)
  nit!: string;

  @IsOptional()
  @IsString()
  @Length(1, 5)
  dv?: string;

  @IsNotEmpty()
  @IsString()
  @Length(3, 200)
  razonSocial!: string;

  @IsOptional()
  @IsString()
  nombreComercial?: string;

  @IsEnum(ThirdPartyType)
  tipo!: ThirdPartyType;

  @IsOptional()
  @IsEnum(ThirdPartyPersonType)
  tipoPersona?: ThirdPartyPersonType;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  ciudad?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  banco?: string;

  @IsOptional()
  @IsString()
  tipoCuenta?: string;

  @IsOptional()
  @IsString()
  cuentaBancaria?: string;

  @IsOptional()
  @IsString()
  actividadEconomica?: string;

  @IsOptional()
  @IsBoolean()
  responsableIva?: boolean;

  @IsOptional()
  @IsString()
  notas?: string;
}
