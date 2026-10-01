import { IsOptional, IsString } from "class-validator";
import { PaginationDto } from "../dto/pagination.dto";

export class FilterDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  find?: string;

  @IsOptional()
  @IsString()
  parentId?: string | null;
}
