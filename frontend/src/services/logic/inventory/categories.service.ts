import { api } from "@/services/api/api";
import { buildQuery } from "@/services/api/buildQuery";

export const categoriesService = {
  list(params?: any) {
    return api.request<any>(`/categories${buildQuery(params)}`)
  },
  getById(id: string) {
    return api.request<any>(`/categories/${id}`)
  },
  get(id: string) {
    return api.request<any>(`/categories/${id}`)
  },
  create(payload: any) {
    return api.request<any>('/categories', { method: 'POST', body: JSON.stringify(payload) })
  },
  update(id: string, payload: any) {
    return api.request<any>(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
  },
  remove(id: string) {
    return api.request<any>(`/categories/${id}`, { method: 'DELETE' })
  },
}
export default categoriesService