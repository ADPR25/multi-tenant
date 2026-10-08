import { api } from "@/services/api/api";
import { buildQuery } from "@/services/api/buildQuery";

export interface StockMovementQuery {
  search?: string;
  warehouseId?: string;
  productId?: string;
  type?: string;
  page?: number;
  limit?: number | string;
  [key: string]: string | number | boolean | null | undefined;
}

export interface StockMovementPayload {
  productId: string;
  warehouseId: string;
  quantity: number;
  type: "IN" | "OUT" | "ADJUSTMENT" | "TRANSFER_OUT";
  reason: string;
  toWarehouseId?: string;
  referenceId?: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  type: string;
  [key: string]: unknown;
}

export interface StockMovementsResponse {
  data: StockMovement[];
  total?: number;
  [key: string]: unknown;
}

export const stockMovementsService = {
  list(p?: StockMovementQuery) {
    return api.request<StockMovementsResponse>(
      `/inventory/stock-movements${buildQuery(p)}`,
    );
  },
  getById(id: string) {
    return api.request<StockMovement>(`/inventory/stock-movements/${id}`);
  },
  create(payload: StockMovementPayload) {
    return api.request<StockMovement>("/inventory/stock-movements", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

export const movementsService = stockMovementsService;
export default stockMovementsService;
