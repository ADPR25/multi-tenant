import { api } from "@/services/api/api";
import { buildQuery } from "@/services/api/buildQuery";

export interface Adjustment {
  id: string
  warehouseId: string
  productId: string
  variantId?: string | null
  type: 'overage' | 'shortage' | 'damaged' | 'expired'
  quantity: number
  lote?: string | null
  serie?: string | null
  reason: string
  notes?: string | null
  status: 'pending' | 'approved' | 'voided'
  warehouse?: any
  product?: any
  variant?: any
  createdAt?: string
}

export const adjustmentsService = {
  list(params?: any) {
    return api.request<any>(`/adjustments${buildQuery(params)}`)
  },
  getById(id: string) {
    return api.request<any>(`/adjustments/${id}`)
  },
  get(id: string) {
    return api.request<any>(`/adjustments/${id}`)
  },
  create(payload: any) {
    return api.request<any>('/adjustments', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  approve(id: string) {
    return api.request<any>(`/adjustments/${id}/approve`, { method: 'PATCH' })
  },
  void(id: string) {
    return api.request<any>(`/adjustments/${id}/void`, { method: 'PATCH' })
  },
  remove(id: string) {
    return api.request<any>(`/adjustments/${id}`, { method: 'DELETE' })
  },
}
export default adjustmentsService