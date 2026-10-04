import { api } from '@/services/api/api'

export const companiesService = {
  list() {
    return api.request<any>('/company')
  },
  getById(id: string) {
    return api.request<any>(`/company/${id}`)
  },
  create(payload: any) {
    return api.request<any>('/company', { method: 'POST', body: JSON.stringify(payload) })
  },
  update(id: string, payload: any) {
    return api.request<any>(`/company/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
  },
  toggleActive(id: string, isActive: boolean) {
    return this.update(id, { isActive })
  },
}
