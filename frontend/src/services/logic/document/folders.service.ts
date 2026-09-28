import { api } from "@/services/api/api";
import { buildQuery } from "@/services/api/buildQuery";

export const foldersService = {
  list(params?: any) {
    return api.request<any>(`/docs/folders${buildQuery(params)}`)
  },
  tree() {
    return api.request<any>(`/docs/folders/tree`)
  },
  getById(id: string) {
    return api.request<any>(`/docs/folders/${id}`)
  },
  create(payload: { name: string; description?: string; parentId?: string }) {
    return api.request<any>('/docs/folders', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  update(id: string, payload: any) {
    return api.request<any>(`/docs/folders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
  move(id: string, targetParentId: string | null) {
    return api.request<any>(`/docs/folders/${id}/move`, {
      method: 'POST',
      body: JSON.stringify({ targetParentId }),
    })
  },
  remove(id: string) {
    return api.request<any>(`/docs/folders/${id}`, { method: 'DELETE' })
  },
}
export default foldersService
