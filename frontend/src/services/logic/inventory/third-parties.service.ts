import { api } from "@/services/api/api";
import { buildQuery } from "@/services/api/buildQuery";

export type ThirdPartyKind = 'CLIENTE' | 'PROVEEDOR' | 'EMPLEADO' | 'CONTRATISTA'

export const ThirdPartiesService = {
  list(params?: { kind?: ThirdPartyKind; search?: string }) {
    return api.request<any>(`/third-parties${buildQuery(params)}`)
  },
  getById(id: string) {
    return api.request<any>(`/third-parties/${id}`)
  },
  get(id: string) {
    return api.request<any>(`/third-parties/${id}`)
  },
  create(payload: any) {
    return api.request<any>('/third-parties', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },
  update(id: string, payload: any) {
    return api.request<any>(`/third-parties/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    })
  },
  remove(id: string) {
    return api.request<any>(`/third-parties/${id}`, { method: 'DELETE' })
  }
}
export const thirdPartiesService = ThirdPartiesService
export default ThirdPartiesService