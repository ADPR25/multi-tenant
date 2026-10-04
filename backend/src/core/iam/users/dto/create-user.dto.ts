import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  Matches,
  Length,
  MinLength,
} from "class-validator";

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^-?\d+$/, {
    message: "document_number debe ser numérico, se permite - al inicio",
  })
  @Length(6, 25)
  document_number: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 50)
  first_name: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 50)
  last_name: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: "La contraseña debe tener mínimo 8 caracteres" })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
    message: "Password debe tener mayúscula, minúscula, número y símbolo",
  })
  password: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsNotEmpty()
  @IsUUID()
  roleId: string;
}
