import { api } from "@/services/api/api";

export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  [key: string]: unknown;
}

export interface RolePermissionsResponse {
  data: RolePermission[];
  roleId?: string;
  [key: string]: unknown;
}

export interface SyncRolePermissionsPayload {
  roleId: string;
  permissionIds: string[];
}

export const rolePermissionService = {
  getByRoleId(roleId: string) {
    return api.request<RolePermissionsResponse>(
      `/role-permissions?roleId=${roleId}`,
    );
  },
  sync(roleId: string, permissionIds: string[]) {
    const payload: SyncRolePermissionsPayload = { roleId, permissionIds };
    return api.request<RolePermissionsResponse>(`/role-permissions/sync`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
