import { api } from "@/services/api/api";

export const rolePermissionService = {
  getByRoleId(roleId: string) {
    return api.request<any>(`/role-permissions/${roleId}`)
  },
}