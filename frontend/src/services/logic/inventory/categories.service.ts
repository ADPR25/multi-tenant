import { api } from '@/services/api/api'
import { buildQuery } from '@/services/api/buildQuery'

export interface CategoryQuery {
  search?: string
  page?: number
  limit?: number | string
  isActive?: boolean
  [key: string]: unknown
}

export interface CategoryPayload {
  name: string
  description?: string
  isActive?: boolean
  [key: string]: unknown
}

export interface Category {
  id: string
  name: string
  isActive: boolean
  [key: string]: unknown
}

export interface CategoriesResponse {
  data: Category[]
  total?: number
  [key: string]: unknown
}

export const categoriesService = {
  list(p?: CategoryQuery) {
    return api.request<CategoriesResponse>(`/inventory/categories${buildQuery(p)}`)
  },
  getById(id: string) {
    return api.request<Category>(`/inventory/categories/${id}`)
  },
  create(payload: CategoryPayload) {
    return api.request<Category>('/inventory/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  update(id: string, payload: Partial<CategoryPayload>) {
    return api.request<Category>(`/inventory/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
  toggleActive(id: string) {
    return api.request<Category>(`/inventory/categories/active/${id}`, { method: 'PATCH' })
  },
}

export default categoriesService
