import { api } from '../../api/api'

interface AssignmentData {
  sidebar?: unknown[]
  permissions?: string[]
  menus?: unknown[]
  [key: string]: unknown
}

interface AssignmentPayload {
  sidebar: unknown[]
  permissions: string[]
}

export const menusService = {
  getAssignment(roleId: string) {
    return api.request<AssignmentData>(`/frontend/roles/${roleId}/assignment-data`)
  },
  saveAssignment(roleId: string, payload: AssignmentPayload) {
    return api.request<AssignmentData>(`/frontend/roles/${roleId}/menus`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },
}
