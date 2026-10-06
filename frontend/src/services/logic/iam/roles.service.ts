import { api } from '@/services/api/api'

export interface RolePayload {
  name: string
  description?: string
  permissions?: string[]
  isActive?: boolean
  [key: string]: unknown
}

export interface Role {
  id: string
  name: string
  isActive: boolean
  permissions?: string[]
  [key: string]: unknown
}

export interface RolesResponse {
  data: Role[]
  total?: number
  [key: string]: unknown
}

export const rolesService = {
  list(active?: boolean) {
    console.log(active)
    return api.request<RolesResponse>('/roles')
  },
  getById(id: string) {
    return api.request<Role>(`/roles/${id}`)
  },
  create(payload: RolePayload) {
    return api.request<Role>('/roles', { method: 'POST', body: JSON.stringify(payload) })
  },
  update(id: string, payload: Partial<RolePayload>) {
    return api.request<Role>(`/roles/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
  },
  toggleActive(id: string, isActive: boolean) {
    return this.update(id, { isActive })
  },
}
