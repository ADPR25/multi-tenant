import { api } from "@/services/api/api";
import { buildQuery } from "@/services/api/buildQuery";

export const wineriesService = {
  list(params?: { branchId?: string }) {
    return api.request<any>(`/wineries${buildQuery(params)}`)
  },
  getById(id: string) {
    return api.request<any>(`/wineries/${id}`)
  },
  get(id: string) {
    return api.request<any>(`/wineries/${id}`)
  },
  create(payload: any) {
    return api.request<any>('/wineries', { method: 'POST', body: JSON.stringify(payload) })
  },
  update(id: string, payload: any) {
    return api.request<any>(`/wineries/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
  },
  remove(id: string) {
    return api.request<any>(`/wineries/${id}`, { method: 'DELETE' })
  },
}
export const warehousesService = wineriesService
export default wineriesService