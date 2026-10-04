import { api } from '@/services/api/api'

export const rolePermissionService = {
  getByRoleId(roleId: string) {
    return api.request<any>(`/role-permissions?roleId=${roleId}`)
  },
  sync(roleId: string, permissionIds: string[]) {
    return api.request<any>(`/role-permissions/sync`, {
      method: 'POST',
      body: JSON.stringify({ roleId, permissionIds }),
    })
  },
}
