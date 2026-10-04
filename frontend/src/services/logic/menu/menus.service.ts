import { api } from '../../api/api'

export const menusService = {
  getAssignment(roleId: string) {
    return api.request<any>(`/frontend/roles/${roleId}/assignment-data`)
  },
  saveAssignment(roleId: string, payload: { sidebar: any[]; permissions: string[] }) {
    return api.request<any>(`/frontend/roles/${roleId}/menus`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },
}
