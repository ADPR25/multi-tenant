import { api } from "@/services/api/api";
import { buildQuery } from "@/services/api/buildQuery";

export const typeDocumentsService = {
  list(params?: any) {
    return api.request<any>(`/docs/type-document${buildQuery(params)}`)
  },
  getById(id: string) {
    return api.request<any>(`/docs/type-document/${id}`)
  },
  create(payload: any) {
    return api.request<any>('/docs/type-document', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  update(id: string, payload: any) {
    return api.request<any>(`/docs/type-document/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
  remove(id: string) {
    return api.request<any>(`/docs/type-document/${id}`, { method: 'DELETE' })
  },
}
export default typeDocumentsService
