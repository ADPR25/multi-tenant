import { api } from '../../api/api'

export const menusService = {
  getAssignment(roleId: string) {
    return api.request<any>(`/menus/roles/${roleId}/assignment-data`)
  },
  saveAssignment(roleId: string, payload: { sidebar: any[], routes: string[], permissions: string[] }) {
    return api.request<any>(`/menus/roles/${roleId}/menus`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  }
}