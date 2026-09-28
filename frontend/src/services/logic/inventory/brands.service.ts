import { api } from "@/services/api/api";
import { buildQuery } from "@/services/api/buildQuery";

export const brandsService = {
  list(params?: any) {
    return api.request<any>(`/brands${buildQuery(params)}`)
  },
  getById(id: string) {
    return api.request<any>(`/brands/${id}`)
  },
  get(id: string) {
    return api.request<any>(`/brands/${id}`)
  },
  create(payload: any) {
    return api.request<any>('/brands', { method: 'POST', body: JSON.stringify(payload) })
  },
  update(id: string, payload: any) {
    return api.request<any>(`/brands/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
  },
  remove(id: string) {
    return api.request<any>(`/brands/${id}`, { method: 'DELETE' })
  },
}
export default brandsService
