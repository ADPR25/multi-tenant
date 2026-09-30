import { IsOptional, IsInt, Min, Max } from "class-validator";
import { Type } from "class-transformer";

export class PaginationDto {
  @IsOptional({ message: "La página es opcional" })
  @Type(() => Number)
  @IsInt({ message: "La página debe ser un número entero" })
  @Min(1, { message: "La página mínima es 1" })
  page: number = 1;

  @IsOptional({ message: "El límite es opcional" })
  @Type(() => Number)
  @IsInt({ message: "El límite debe ser un número entero" })
  @Min(1, { message: "El límite mínimo es 1" })
  limit: number = 20;

  get skip() { return (this.page - 1) * this.limit; }
}

export class PaginatedResponseDto<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  constructor(data: T[], total: number, page: number, limit: number) {
    this.data = data;
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
  }
}