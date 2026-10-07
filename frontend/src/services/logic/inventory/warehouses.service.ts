import { api } from "@/services/api/api";
import { buildQuery } from "@/services/api/buildQuery";

export interface WarehouseQuery {
  search?: string;
  page?: number;
  limit?: number | string;
  isActive?: boolean;
  [key: string]: unknown;
}

export interface WarehousePayload {
  name: string;
  code?: string;
  address?: string;
  isActive?: boolean;
  [key: string]: unknown;
}

export interface Warehouse {
  id: string;
  name: string;
  code?: string;
  isActive: boolean;
  [key: string]: unknown;
}

export interface WarehousesResponse {
  data: Warehouse[];
  total?: number;
  [key: string]: unknown;
}

export const warehousesService = {
  list(p?: WarehouseQuery) {
    return api.request<WarehousesResponse>(
      `/inventory/warehouses${buildQuery(p)}`,
    );
  },
  getById(id: string) {
    return api.request<Warehouse>(`/inventory/warehouses/${id}`);
  },
  create(payload: WarehousePayload) {
    return api.request<Warehouse>("/inventory/warehouses", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  update(id: string, payload: Partial<WarehousePayload>) {
    return api.request<Warehouse>(`/inventory/warehouses/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  toggleActive(id: string) {
    return api.request<Warehouse>(`/inventory/warehouses/active/${id}`, {
      method: "PATCH",
    });
  },
};

export const wineriesService = warehousesService;
export const branchesService = warehousesService;
export default warehousesService;
