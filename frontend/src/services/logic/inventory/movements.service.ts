import { api } from "@/services/api/api";
import { buildQuery } from "@/services/api/buildQuery";

export const movementsService = {
  list(params?: any) {
    return api.request<any>(`/movements${buildQuery(params)}`)
  },
  getById(id: string) {
    return api.request<any>(`/movements/${id}`)
  },
  get(id: string) {
    return api.request<any>(`/movements/${id}`)
  },
  create(payload: any) {
    return api.request<any>('/movements', { method: 'POST', body: JSON.stringify(payload) })
  },
  approve(id: string) {
    return api.request<any>(`/movements/${id}/approve`, { method: 'PATCH' })
  },
  cancel(id: string) {
    return api.request<any>(`/movements/${id}/cancel`, { method: 'PATCH' })
  },
  remove(id: string) {
    return api.request<any>(`/movements/${id}`, { method: 'DELETE' })
  },
}
export default movementsService