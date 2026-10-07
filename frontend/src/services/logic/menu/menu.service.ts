import { api } from "../../api/api";

export interface SidebarItem {
  title: string;
  path: string;
  icon?: string;
  children?: SidebarItem[];
  permission?: string;
  meta?: Record<string, unknown>;
  name?: string;
}

export interface RouteItem {
  path: string;
  name: string;
  title?: string;
  component?: string;
  componentPath?: string;
  meta?: Record<string, unknown>;
}

export interface AssignmentData {
  sidebar: SidebarItem[];
  routes?: RouteItem[];
  permissions?: string[];
  menus?: unknown[];
  [key: string]: unknown;
}

export interface SaveRolePayload {
  sidebar: SidebarItem[];
  permissions?: string[];
  routes?: RouteItem[];
  [key: string]: unknown;
}

export const menuService = {
  getSidebar() {
    return api.request<SidebarItem[]>("/frontend/sidebar");
  },
  getRoutes() {
    return api.request<RouteItem[]>("/frontend/routes");
  },
  getSidebarRaw() {
    return api.request<SidebarItem[]>("/frontend/sidebar/raw");
  },
  getRoutesRaw() {
    return api.request<RouteItem[]>("/frontend/routes/raw");
  },
  getRawForRole(roleId: string) {
    return api.request<{ sidebar: SidebarItem[]; routes: RouteItem[] }>(
      `/frontend/roles/${roleId}/raw`,
    );
  },
  getAssignmentData(roleId: string) {
    return api.request<AssignmentData>(
      `/frontend/roles/${roleId}/assignment-data`,
    );
  },
  saveForRole(roleId: string, payload: SaveRolePayload) {
    return api.request<AssignmentData>(`/frontend/roles/${roleId}/menus`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
};
