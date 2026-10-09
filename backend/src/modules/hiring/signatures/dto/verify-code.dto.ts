
import { IsNotEmpty, IsOptional, IsString, Length } from "class-validator";

export class VerifyCodeDto {
  @IsNotEmpty()
  @IsString()
  @Length(6,6)
  codigo!: string;

  @IsOptional()
  @IsString()
  firmaBase64?: string;
}
