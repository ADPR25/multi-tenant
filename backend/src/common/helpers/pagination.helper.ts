import { PaginatedResponseDto, PaginationDto } from "../dto/pagination.dto";

export function paginate(pagination: PaginationDto) {
  if (pagination.limit === 'all') {
    return {};
  }
  return {
    take: pagination.limit as number,
    skip: pagination.skip,
  };
}

export function paginatedResponse<T>(data: T[], total: number, pagination: PaginationDto) {
  if (pagination.limit === 'all') {
    return {
      data,
      total,
      page: 1,
      limit: total,
      totalPages: 1,
    };
  }
  return new PaginatedResponseDto(data, total, pagination.page, pagination.limit as number);
}