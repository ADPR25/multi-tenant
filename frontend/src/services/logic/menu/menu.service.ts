import { api } from '../../api/api'

export interface SidebarItem {
  title: string
  path: string
  icon?: string
  children?: SidebarItem[]
  permission?: string
  meta?: Record<string, unknown>
}

export interface RouteItem {
  path: string
  name: string
  title?: string
  component?: string
  componentPath?: string
  meta?: Record<string, unknown>
}

export const menuService = {
  getSidebar() {
    return api.request<SidebarItem[]>('/menus/sidebar')
  },
  getRoutes() {
    return api.request<RouteItem[]>('/menus/routes')
  },
  getSidebarRaw() {
    return api.request<SidebarItem[]>('/menus/sidebar/raw')
  },
  getRoutesRaw() {
    return api.request<RouteItem[]>('/menus/routes/raw')
  },
  getRawForRole(roleId: string) {
    return api.request<{ sidebar: SidebarItem[]; routes: RouteItem[] }>(`/menus/roles/${roleId}/raw`)
  },
  getAssignmentData(roleId: string) {
    return api.request<{ 
      allPermissions: string[]
      rolePermissions: string[]
      sidebar: SidebarItem[]
      routes: RouteItem[]
    }>(`/menus/roles/${roleId}/assignment-data`)
  },
  saveForRole(roleId: string, payload: { sidebar: SidebarItem[]; routes: RouteItem[]; permissions?: string[] }) {
    return api.request(`/menus/roles/${roleId}/menus`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  }
}