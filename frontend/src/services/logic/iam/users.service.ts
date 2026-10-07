import { api } from "@/services/api/api";

export interface UserPayload {
  name: string;
  email: string;
  roleId?: string;
  isActive?: boolean;
  password?: string;
  [key: string]: unknown;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  roleId?: string;
  [key: string]: unknown;
}

export interface UsersResponse {
  data: User[];
  total?: number;
  [key: string]: unknown;
}

export const usersService = {
  list() {
    return api.request<UsersResponse>("/users");
  },
  getById(id: string) {
    return api.request<User>(`/users/${id}`);
  },
  create(payload: UserPayload) {
    return api.request<User>("/users", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  update(id: string, payload: Partial<UserPayload>) {
    return api.request<User>(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  toggleActive(id: string, isActive: boolean) {
    return this.update(id, { isActive });
  },
};
