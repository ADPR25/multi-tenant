import { IsNotEmpty, IsOptional, IsString, IsUUID, IsNumberString, IsDateString, IsInt } from "class-validator";

export class CreateContractDto {
  @IsNotEmpty()
  @IsString()
  code!: string;

  @IsOptional()
  @IsString()
  contractNumber?: string;

  @IsNotEmpty()
  @IsUUID()
  thirdPartyId!: string;

  @IsOptional()
  @IsUUID()
  supervisorId?: string;

  @IsNotEmpty()
  @IsString()
  purpose!: string;

  @IsOptional()
  @IsString()
  observation?: string;

  @IsNotEmpty()
  @IsNumberString()
  totalAmount!: string;

  @IsOptional()
  @IsNumberString()
  firstPaymentAmount?: string;

  @IsOptional()
  @IsInt()
  timesPaid?: number;

  @IsNotEmpty()
  @IsDateString()
  startDate!: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  projectName?: string;

  @IsOptional()
  @IsUUID()
  projectId?: string;
}