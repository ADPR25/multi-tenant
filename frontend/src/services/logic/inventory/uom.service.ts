import { api } from "@/services/api/api";
import { buildQuery } from "@/services/api/buildQuery";

export interface UomQuery {
  search?: string;
  page?: number;
  limit?: number | string;
  isActive?: boolean;
  [key: string]: unknown;
}

export interface UomPayload {
  name: string;
  shortName?: string;
  code?: string;
  isActive?: boolean;
  [key: string]: unknown;
}

export interface Uom {
  id: string;
  name: string;
  shortName?: string;
  isActive: boolean;
  [key: string]: unknown;
}

export interface UomResponse {
  data: Uom[];
  total?: number;
  [key: string]: unknown;
}

export const uomService = {
  list(p?: UomQuery) {
    return api.request<UomResponse>(`/inventory/uom${buildQuery(p)}`);
  },
  getById(id: string) {
    return api.request<Uom>(`/inventory/uom/${id}`);
  },
  create(payload: UomPayload) {
    return api.request<Uom>("/inventory/uom", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  update(id: string, payload: Partial<UomPayload>) {
    return api.request<Uom>(`/inventory/uom/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  toggleActive(id: string) {
    return api.request<Uom>(`/inventory/uom/active/${id}`, { method: "PATCH" });
  },
};

export default uomService;
