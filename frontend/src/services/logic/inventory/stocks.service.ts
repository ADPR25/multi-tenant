import { api } from '@/services/api/api'
import { buildQuery } from '@/services/api/buildQuery'
export const stocksService = {
  list(p?: any) {
    return api.request<any>(`/inventory/stocks${buildQuery(p)}`)
  },
  getById(id: string) {
    return api.request<any>(`/inventory/stocks/${id}`)
  },
  create(payload: any) {
    return api.request<any>('/inventory/stocks', { method: 'POST', body: JSON.stringify(payload) })
  },
}
export default stocksService
