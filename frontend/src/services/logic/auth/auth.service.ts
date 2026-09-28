import { api } from "@/services/api/api";

export const authService = {
  login(payload: { email: string; password: string }) {
    return api.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  me() {
    return api.request<any>('/auth/me')
  },
}