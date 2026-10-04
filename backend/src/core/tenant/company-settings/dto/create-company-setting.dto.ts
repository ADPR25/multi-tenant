import { IsNotEmpty, IsString } from "class-validator";

export class CreateCompanySettingDto {
  @IsNotEmpty()
  @IsString()
  language: string;

  @IsNotEmpty()
  @IsString()
  logoUrl: string;

  @IsNotEmpty()
  @IsString()
  currency: string;
}
