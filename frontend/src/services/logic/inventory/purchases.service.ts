import { api } from "@/services/api/api";
import { buildQuery } from "@/services/api/buildQuery";

export const purchasesService = {
  list(params?: any) {
    return api.request<any>(`/purchases${buildQuery(params)}`)
  },
  getById(id: string) {
    return api.request<any>(`/purchases/${id}`)
  },
  get(id: string) {
    return api.request<any>(`/purchases/${id}`)
  },
  create(payload: any) {
    return api.request<any>('/purchases', { method: 'POST', body: JSON.stringify(payload) })
  },
  receive(id: string) {
    return api.request<any>(`/purchases/${id}/receive`, { method: 'PATCH' })
  },
  cancel(id: string) {
    return api.request<any>(`/purchases/${id}/cancel`, { method: 'PATCH' })
  },
  remove(id: string) {
    return api.request<any>(`/purchases/${id}`, { method: 'DELETE' })
  },
}
export default purchasesService