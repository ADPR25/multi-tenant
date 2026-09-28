import { api } from "@/services/api/api";
import { buildQuery } from "@/services/api/buildQuery";

export const salesService = {
  list(params?: any) {
    return api.request<any>(`/sales${buildQuery(params)}`)
  },
  getById(id: string) {
    return api.request<any>(`/sales/${id}`)
  },
  get(id: string) {
    return api.request<any>(`/sales/${id}`)
  },
  create(payload: any) {
    return api.request<any>('/sales', { method: 'POST', body: JSON.stringify(payload) })
  },
  complete(id: string) {
    return api.request<any>(`/sales/${id}/complete`, { method: 'PATCH' })
  },
  cancel(id: string) {
    return api.request<any>(`/sales/${id}/cancel`, { method: 'PATCH' })
  },
  remove(id: string) {
    return api.request<any>(`/sales/${id}`, { method: 'DELETE' })
  },
}
export default salesService