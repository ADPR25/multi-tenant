import { api } from "@/services/api/api";

export const usersService = {
  list() {
    return api.request<any>('/users')
  },
  getById(id: string) {
    return api.request<any>(`/users/${id}`)
  },
  create(payload: any) {
    return api.request<any>('/users', { method: 'POST', body: JSON.stringify(payload) })
  },
  update(id: string, payload: any) {
    return api.request<any>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
  },
  toggleActive(id: string, isActive: boolean) {
    return this.update(id, { isActive })
  },
}