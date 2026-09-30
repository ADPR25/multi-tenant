import { api } from '@/services/api/api'
import { buildQuery } from '@/services/api/buildQuery'
export const documentCategoriesService = {
  list(p?: any) {
    return api.request<any>(`/document_management/documents/categories${buildQuery(p)}`)
  },
  getById(id: string) {
    return api.request<any>(`/document_management/documents/categories/${id}`)
  },
  create(payload: any) {
    return api.request<any>('/document_management/documents/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  update(id: string, payload: any) {
    return api.request<any>(`/document_management/documents/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
  toggleActive(id: string) {
    return api.request<any>(`/document_management/documents/categories/active/${id}`, {
      method: 'PATCH',
    })
  },
}
export const categoriesService = documentCategoriesService
export default documentCategoriesService
