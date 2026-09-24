import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateRoleDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsBoolean()
  isPrincipal: boolean;
}