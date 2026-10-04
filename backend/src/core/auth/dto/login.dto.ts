import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  document_number: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;
}

export class RefreshDto {
  @IsNotEmpty()
  @IsString()
  refresh_token: string;
}
