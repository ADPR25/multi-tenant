import { api } from "@/services/api/api";
import { buildQuery } from "@/services/api/buildQuery";

export interface BrandQuery {
  search?: string;
  page?: number;
  limit?: number | string;
  isActive?: boolean;
  [key: string]: unknown;
}

export interface BrandPayload {
  name: string;
  description?: string;
  isActive?: boolean;
  [key: string]: unknown;
}

export interface Brand {
  id: string;
  name: string;
  isActive: boolean;
  [key: string]: unknown;
}

export interface BrandsResponse {
  data: Brand[];
  total?: number;
  [key: string]: unknown;
}

export const brandsService = {
  list(p?: BrandQuery) {
    return api.request<BrandsResponse>(`/inventory/brands${buildQuery(p)}`);
  },
  getById(id: string) {
    return api.request<Brand>(`/inventory/brands/${id}`);
  },
  create(payload: BrandPayload) {
    return api.request<Brand>("/inventory/brands", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  update(id: string, payload: Partial<BrandPayload>) {
    return api.request<Brand>(`/inventory/brands/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  toggleActive(id: string) {
    return api.request<Brand>(`/inventory/brands/active/${id}`, {
      method: "PATCH",
    });
  },
};

export default brandsService;
