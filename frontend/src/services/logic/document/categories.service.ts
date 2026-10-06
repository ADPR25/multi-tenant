import { api } from '@/services/api/api'
import { buildQuery } from '@/services/api/buildQuery'

export interface DocumentCategoryQuery {
  search?: string
  page?: number
  limit?: number | string
  isActive?: boolean
  [key: string]: unknown
}

export interface DocumentCategoryPayload {
  name: string
  description?: string
  isActive?: boolean
  [key: string]: unknown
}

export interface DocumentCategory {
  id: string
  name: string
  isActive: boolean
  [key: string]: unknown
}

export interface DocumentCategoriesResponse {
  data: DocumentCategory[]
  total?: number
  [key: string]: unknown
}

export const documentCategoriesService = {
  list(p?: DocumentCategoryQuery) {
    return api.request<DocumentCategoriesResponse>(
      `/document_management/documents/categories${buildQuery(p)}`,
    )
  },
  getById(id: string) {
    return api.request<DocumentCategory>(`/document_management/documents/categories/${id}`)
  },
  create(payload: DocumentCategoryPayload) {
    return api.request<DocumentCategory>('/document_management/documents/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  update(id: string, payload: Partial<DocumentCategoryPayload>) {
    return api.request<DocumentCategory>(`/document_management/documents/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
  toggleActive(id: string) {
    return api.request<DocumentCategory>(`/document_management/documents/categories/active/${id}`, {
      method: 'PATCH',
    })
  },
}

export const categoriesService = documentCategoriesService
export default documentCategoriesService
