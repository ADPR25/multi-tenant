import { api } from "@/services/api/api";
import { buildQuery } from "@/services/api/buildQuery";


export const documentCategoriesService = {
  list(params?: any) {
    return api.request<any>(`/docs/categories${buildQuery(params)}`)
  },
  getById(id: string) {
    return api.request<any>(`/docs/categories/${id}`)
  },
  create(payload: { name: string; description?: string; color?: string }) {
    return api.request<any>('/docs/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  update(id: string, payload: any) {
    return api.request<any>(`/docs/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
  remove(id: string) {
    return api.request<any>(`/docs/categories/${id}`, { method: 'DELETE' })
  },
}
export default documentCategoriesService
