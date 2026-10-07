import { api } from "@/services/api/api";
import { buildQuery } from "@/services/api/buildQuery";

export interface StockQuery {
  search?: string;
  warehouseId?: string;
  productId?: string;
  page?: number;
  limit?: number | string;
  [key: string]: unknown;
}

export interface StockPayload {
  productId: string;
  warehouseId: string;
  quantity: number;
  [key: string]: unknown;
}

export interface Stock {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  [key: string]: unknown;
}

export interface StocksResponse {
  data: Stock[];
  total?: number;
  [key: string]: unknown;
}

export const stocksService = {
  list(p?: StockQuery) {
    return api.request<StocksResponse>(`/inventory/stocks${buildQuery(p)}`);
  },
  getById(id: string) {
    return api.request<Stock>(`/inventory/stocks/${id}`);
  },
  create(payload: StockPayload) {
    return api.request<Stock>("/inventory/stocks", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

export default stocksService;
