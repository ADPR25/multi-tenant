import { IsNotEmpty, IsOptional, IsString, Length } from "class-validator";

export class VerifyCodeDto {
  @IsNotEmpty()
  @IsString()
  @Length(6,6)
  code!: string;

  @IsOptional()
  @IsString()
  signatureBase64?: string;
}