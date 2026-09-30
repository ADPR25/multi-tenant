import { api } from "@/services/api/api";

export const authService = {
  login(payload: { document_number: string; password: string }) {
    return api.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  me() {
    return api.request<any>('/auth/me')
  },
  refresh(payload: { refresh_token: string }) {
    return api.request<any>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  logout(payload: { refresh_token: string }) {
    return api.request<any>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
}