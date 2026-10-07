import { api } from "@/services/api/api";
import { buildQuery } from "@/services/api/buildQuery";

export interface ProductQuery {
  search?: string;
  categoryId?: string;
  page?: number;
  limit?: number | string;
  isActive?: boolean;
  [key: string]: unknown;
}

export interface ProductPayload {
  name: string;
  code?: string;
  categoryId?: string;
  uomId?: string;
  price?: number;
  isActive?: boolean;
  [key: string]: unknown;
}

export interface Product {
  id: string;
  name: string;
  code?: string;
  isActive: boolean;
  [key: string]: unknown;
}

export interface ProductsResponse {
  data: Product[];
  total?: number;
  [key: string]: unknown;
}

export const productsService = {
  list(p?: ProductQuery) {
    return api.request<ProductsResponse>(`/inventory/products${buildQuery(p)}`);
  },
  getById(id: string) {
    return api.request<Product>(`/inventory/products/${id}`);
  },
  create(payload: ProductPayload) {
    return api.request<Product>("/inventory/products", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  update(id: string, payload: Partial<ProductPayload>) {
    return api.request<Product>(`/inventory/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  toggleActive(id: string) {
    return api.request<Product>(`/inventory/products/active/${id}`, {
      method: "PATCH",
    });
  },
};

export default productsService;
