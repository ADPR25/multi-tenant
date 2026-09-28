import { api } from "@/services/api/api";
import { buildQuery } from "@/services/api/buildQuery";

export const productsService = {
  list(params?: any) {
    return api.request<any>(`/products${buildQuery(params)}`)
  },
  getById(id: string) {
    return api.request<any>(`/products/${id}`)
  },
  get(id: string) {
    return api.request<any>(`/products/${id}`)
  },
  create(payload: any) {
    return api.request<any>('/products', { method: 'POST', body: JSON.stringify(payload) })
  },
  update(id: string, payload: any) {
    return api.request<any>(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
  },
  remove(id: string) {
    return api.request<any>(`/products/${id}`, { method: 'DELETE' })
  },
}
export default productsService