import { api } from "@/services/api/api";
import { buildQuery } from "@/services/api/buildQuery";

export const inventoryService = {
  list(params?: any) {
    return api.request<any>(`/inventory${buildQuery(params)}`)
  },
  getById(id: string) {
    return api.request<any>(`/inventory/${id}`)
  },
  get(id: string) {
    return api.request<any>(`/inventory/${id}`)
  },
  create(payload: any) {
    return api.request<any>('/inventory', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  update(id: string, payload: any) {
    return api.request<any>(`/inventory/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
  remove(id: string) {
    return api.request<any>(`/inventory/${id}`, { method: 'DELETE' })
  },
}
export default inventoryService