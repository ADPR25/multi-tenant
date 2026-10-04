import { api } from '@/services/api/api'
import { buildQuery } from '@/services/api/buildQuery'
export const uomService = {
  list(p?: any) {
    return api.request<any>(`/inventory/uom${buildQuery(p)}`)
  },
  getById(id: string) {
    return api.request<any>(`/inventory/uom/${id}`)
  },
  create(payload: any) {
    return api.request<any>('/inventory/uom', { method: 'POST', body: JSON.stringify(payload) })
  },
  update(id: string, payload: any) {
    return api.request<any>(`/inventory/uom/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
  toggleActive(id: string) {
    return api.request<any>(`/inventory/uom/active/${id}`, { method: 'PATCH' })
  },
}
export default uomService
