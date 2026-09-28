import { api } from "@/services/api/api";
import { buildQuery } from "@/services/api/buildQuery";

export const documentsService = {
  list(params?: any) {
    return api.request<any>(`/docs/documents${buildQuery(params)}`)
  },
  getById(id: string) {
    return api.request<any>(`/docs/documents/${id}`)
  },
  getPresigned(id: string) {
    return api.request<any>(`/docs/documents/${id}/presigned`)
  },
  expiringSoon(days = 30) {
    return api.request<any>(`/docs/documents/expiring-soon${buildQuery({ days })}`)
  },
  create(payload: FormData | any) {
    const isForm = payload instanceof FormData
    return api.request<any>('/docs/documents', {
      method: 'POST',
      body: isForm ? payload : JSON.stringify(payload),
      headers: isForm ? {} as any : undefined,
    } as any)
  },
  update(id: string, payload: any) {
    return api.request<any>(`/docs/documents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
  remove(id: string) {
    return api.request<any>(`/docs/documents/${id}`, { method: 'DELETE' })
  },
  share(id: string, payload: any) {
    return api.request<any>(`/docs/documents/${id}/share`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  getShared(token: string) {
    return api.request<any>(`/docs/documents/shared/${token}`)
  },
  requestApproval(id: string) {
    return api.request<any>(`/docs/documents/${id}/request-approval`, { method: 'POST' })
  },
  approve(id: string, comments?: string) {
    return api.request<any>(`/docs/documents/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ comments }),
    })
  },
  reject(id: string, comments: string) {
    return api.request<any>(`/docs/documents/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ comments }),
    })
  },
  bulkDelete(ids: string[]) {
    return api.request<any>(`/docs/documents/bulk/delete`, {
      method: 'POST',
      body: JSON.stringify({ ids }),
    })
  },
  bulkMove(ids: string[], folderId: string | null) {
    return api.request<any>(`/docs/documents/bulk/move`, {
      method: 'POST',
      body: JSON.stringify({ ids, folderId }),
    })
  },
  // versioning helpers - if you expose endpoints
  getVersions(id: string) {
    return api.request<any>(`/docs/documents/${id}/versions`)
  },
  newVersion(id: string, formData: FormData) {
    return api.request<any>(`/docs/documents/${id}/new-version`, {
      method: 'POST',
      body: formData,
      headers: {} as any,
    } as any)
  }
}
export default documentsService
