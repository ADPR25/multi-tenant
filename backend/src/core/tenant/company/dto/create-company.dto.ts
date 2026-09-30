import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateCompanyDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  legal_name: string;

  @IsNotEmpty()
  @IsString()
  tax_id: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  address: string;
}
