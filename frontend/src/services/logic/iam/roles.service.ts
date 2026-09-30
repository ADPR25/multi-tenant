import { api } from "@/services/api/api";
export const rolesService = {
  list(active?: boolean) {
    console.log(active)
    return api.request<any>('/roles')
  },
  getById(id: string) {
    return api.request<any>(`/roles/${id}`)
  },
  create(payload: any) {
    return api.request<any>('/roles', { method: 'POST', body: JSON.stringify(payload) })
  },
  update(id: string, payload: any) {
    return api.request<any>(`/roles/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
  },
  toggleActive(id: string, isActive: boolean) {
    return this.update(id, { isActive })
  }
}