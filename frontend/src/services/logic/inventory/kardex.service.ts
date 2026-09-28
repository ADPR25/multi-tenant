import { api } from "@/services/api/api";
import { buildQuery } from "@/services/api/buildQuery";

export const kardexService = {
  list(params?: any) {
    return api.request<any>(`/kardex${buildQuery(params)}`)
  },
  getById(id: string) {
    return api.request<any>(`/kardex/${id}`)
  },
  get(id: string) {
    return api.request<any>(`/kardex/${id}`)
  },
  create(payload: any) {
    return api.request<any>('/kardex', { method: 'POST', body: JSON.stringify(payload) })
  },
}
export default kardexService