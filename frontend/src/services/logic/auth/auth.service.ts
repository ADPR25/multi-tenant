import { api } from "@/services/api/api";

export interface LoginPayload {
  document_number: string;
  password: string;
}

export interface RefreshPayload {
  refresh_token: string;
}

export interface LogoutPayload {
  refresh_token: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user?: {
    id: string;
    document_number: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface UserMe {
  id: string;
  document_number: string;
  [key: string]: unknown;
}

export const authService = {
  login(payload: LoginPayload) {
    return api.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  me() {
    return api.request<UserMe>("/auth/me");
  },
  refresh(payload: RefreshPayload) {
    return api.request<AuthResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  logout(payload: LogoutPayload) {
    return api.request<{ success: boolean }>("/auth/logout", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
