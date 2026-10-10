import { IsOptional, IsInt, Min, ValidateIf } from "class-validator";
import { Transform } from "class-transformer";

export class PaginationDto {
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => Number(value))
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === "all") return "all";
    return Number(value);
  })
  @ValidateIf((o: PaginationDto) => o.limit !== "all")
  @IsInt({ message: "Limit must be an integer or 'all'" })
  @Min(1)
  limit: number | "all" = 20;

  get skip(): number {
    if (this.limit === "all") return 0;
    return (this.page - 1) * this.limit;
  }

  get isAll(): boolean {
    return this.limit === "all";
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
