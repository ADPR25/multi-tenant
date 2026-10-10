import { IsEnum, IsOptional, IsString, IsBoolean, IsNotEmpty, Length, IsEmail } from "class-validator";
import { ThirdPartyType } from "../enums/third-party-type.enum";
import { ThirdPartyPersonType } from "../enums/third-party-person-type.enum";

export class CreateThirdPartyDto {
  @IsNotEmpty()
  @IsString()
  @Length(5, 20)
  taxId!: string;

  @IsOptional()
  @IsString()
  @Length(1, 5)
  verificationDigit?: string;

  @IsNotEmpty()
  @IsString()
  @Length(3, 200)
  legalName!: string;

  @IsOptional()
  @IsString()
  tradeName?: string;

  @IsEnum(ThirdPartyType)
  type!: ThirdPartyType;

  @IsOptional()
  @IsEnum(ThirdPartyPersonType)
  personType?: ThirdPartyPersonType;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  bankAccountType?: string;

  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @IsOptional()
  @IsString()
  economicActivity?: string;

  @IsOptional()
  @IsBoolean()
  isVatResponsible?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}