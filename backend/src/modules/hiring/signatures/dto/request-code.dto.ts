
import { IsNotEmpty, IsEmail } from "class-validator";

export class RequestCodeDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string;
}
