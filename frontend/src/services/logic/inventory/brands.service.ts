import { api } from '@/services/api/api'
import { buildQuery } from '@/services/api/buildQuery'
export const brandsService = {
  list(p?: any) {
    return api.request<any>(`/inventory/brands${buildQuery(p)}`)
  },
  getById(id: string) {
    return api.request<any>(`/inventory/brands/${id}`)
  },
  create(payload: any) {
    return api.request<any>('/inventory/brands', { method: 'POST', body: JSON.stringify(payload) })
  },
  update(id: string, payload: any) {
    return api.request<any>(`/inventory/brands/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
  toggleActive(id: string) {
    return api.request<any>(`/inventory/brands/active/${id}`, { method: 'PATCH' })
  },
}
export default brandsService
