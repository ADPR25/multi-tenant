import { api } from "@/services/api/api";

export const companiesService = {
  list() {
    return api.request<any>('/companies')
  },
  getById(id: string) {
    return api.request<any>(`/companies/${id}`)
  },
  create(payload: any) {
    return api.request<any>('/companies', { method: 'POST', body: JSON.stringify(payload) })
  },
  update(id: string, payload: any) {
    return api.request<any>(`/companies/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
  },
  toggleActive(id: string, isActive: boolean) {
    return this.update(id, { isActive })
  }
}