import { api } from '@/services/api/api'

export interface CompanyPayload {
  name: string
  nit?: string
  address?: string
  email?: string
  phone?: string
  isActive?: boolean
  [key: string]: unknown
}

export interface Company {
  id: string
  name: string
  isActive: boolean
  nit?: string
  [key: string]: unknown
}

export interface CompaniesResponse {
  data: Company[]
  total?: number
  [key: string]: unknown
}

export const companiesService = {
  list() {
    return api.request<CompaniesResponse>('/company')
  },
  getById(id: string) {
    return api.request<Company>(`/company/${id}`)
  },
  create(payload: CompanyPayload) {
    return api.request<Company>('/company', { method: 'POST', body: JSON.stringify(payload) })
  },
  update(id: string, payload: Partial<CompanyPayload>) {
    return api.request<Company>(`/company/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
  toggleActive(id: string, isActive: boolean) {
    return this.update(id, { isActive })
  },
}
