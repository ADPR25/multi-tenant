import { IsOptional, IsInt, Min } from "class-validator";
import { Transform } from "class-transformer";
import { ValidateIf } from "class-validator";

export class PaginationDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'all') return 'all';
    return Number(value);
  })
  @ValidateIf(o => o.limit !== 'all')
  @IsInt({ message: "El límite debe ser un número entero o 'all'" })
  @Min(1)
  limit: number | 'all' = 20;

  get skip() { 
    if (this.limit === 'all') return 0;
    return (this.page - 1) * (this.limit as number); 
  }

  get isAll() {
    return this.limit === 'all';
  }
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