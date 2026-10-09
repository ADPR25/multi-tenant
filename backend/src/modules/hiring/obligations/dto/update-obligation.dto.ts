
import { PartialType } from "@nestjs/mapped-types";
import { CreateObligationDto } from "./create-obligation.dto";
import { IsOptional, IsBoolean } from "class-validator";

export class UpdateObligationDto extends PartialType(CreateObligationDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
