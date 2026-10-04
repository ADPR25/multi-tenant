import { PartialType } from "@nestjs/mapped-types";
import { CreateUomDto } from "./create-uom.dto";
import { IsBoolean, IsOptional } from "class-validator";

export class UpdateUomDto extends PartialType(CreateUomDto) {
  @IsOptional()
  @IsBoolean()
  isActive: boolean;
}
