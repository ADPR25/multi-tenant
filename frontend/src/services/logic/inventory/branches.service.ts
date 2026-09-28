import { api } from "@/services/api/api";
import { buildQuery } from "@/services/api/buildQuery";

export const branchesService = {
  list(params?: any) {
    return api.request<any>(`/branches${buildQuery(params)}`)
  },
  getById(id: string) {
    return api.request<any>(`/branches/${id}`)
  },
  get(id: string) {
    return api.request<any>(`/branches/${id}`)
  },
  create(payload: any) {
    return api.request<any>('/branches', { method: 'POST', body: JSON.stringify(payload) })
  },
  update(id: string, payload: any) {
    return api.request<any>(`/branches/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
  },
  remove(id: string) {
    return api.request<any>(`/branches/${id}`, { method: 'DELETE' })
  },
}
export default branchesService