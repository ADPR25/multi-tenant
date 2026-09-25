import { IsNotEmpty, IsString } from "class-validator";

export class CreateUomDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  short_name: string;
}
