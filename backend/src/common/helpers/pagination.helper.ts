import { PaginationDto } from "../dto/pagination.dto";

export function paginate(pagination: PaginationDto) {
  return {
    skip: pagination.skip,
    take: pagination.limit,
  };
}

export function paginatedResponse<T>(data: T[], total: number, pagination: PaginationDto) {
  return {
    data,
    total,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.ceil(total / pagination.limit),
  };
}