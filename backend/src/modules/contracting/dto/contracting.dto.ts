import { PartialType } from "@nestjs/mapped-types";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
} from "class-validator";
import {
  ContractStatus,
  ContractTypeCode,
  PaymentTerms,
  RiskLevel,
  ThirdPartyType,
} from "../entities/contract.entity";

export class CreateThirdPartyDto {
  @IsEnum(ThirdPartyType)
  type: ThirdPartyType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  legalName?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  taxId: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  contactPerson?: string;

  @IsOptional()
  @IsEnum(RiskLevel)
  riskLevel?: RiskLevel;
}

export class UpdateThirdPartyDto extends PartialType(CreateThirdPartyDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateContractTypeDto {
  @IsEnum(ContractTypeCode)
  code: ContractTypeCode;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsBoolean()
  requiresPolicy?: boolean;
}

export class UpdateContractTypeDto extends PartialType(CreateContractTypeDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateContractDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsUUID()
  contractTypeId: string;

  @IsUUID()
  thirdPartyId: string;

  @IsString()
  @IsNotEmpty()
  object: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  totalValue: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsDateString()
  signatureDate?: string;

  @IsOptional()
  @IsEnum(PaymentTerms)
  paymentTerms?: PaymentTerms;

  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;

  @IsOptional()
  @IsUUID()
  supervisorId?: string;
}

export class UpdateContractDto extends PartialType(CreateContractDto) {
  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;
}