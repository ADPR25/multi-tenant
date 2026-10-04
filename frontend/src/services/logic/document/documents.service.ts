import { api } from '@/services/api/api'
import { buildQuery } from '@/services/api/buildQuery'
import { get } from '@/store/authstore'

export const documentsService = {
  list(p?: any) {
    return api.request<any>(`/document_management/documents/docs${buildQuery(p)}`)
  },
  getById(id: string) {
    return api.request<any>(`/document_management/documents/docs/${id}`)
  },
  create(payload: any) {
    return api.request<any>('/document_management/documents/docs', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  upload(formData: FormData) {
    return api.request<any>('/document_management/documents/docs/upload', {
      method: 'POST',
      body: formData,
    })
  },
  update(id: string, payload: any) {
    return api.request<any>(`/document_management/documents/docs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
  toggleActive(id: string) {
    return api.request<any>(`/document_management/documents/docs/active/${id}`, { method: 'PATCH' })
  },
  delete(id: string) {
    return api.request<any>(`/document_management/documents/docs/${id}`, {
      method: 'DELETE',
    })
  },
  downloadUrl(storageKey: string, withToken = true) {
    const backend =
      get.useAuth('backend_api') ||
      localStorage.getItem('backend_api') ||
      import.meta.env.VITE_BACKEND_API_URL
    const token = get.useAuth('token')
    if (withToken && token) {
      return `${backend}/uploads/${storageKey}?token=${token}`
    }
    return `${backend}/uploads/${storageKey}`
  },
  async downloadBlob(storageKey: string): Promise<Blob> {
    const backend =
      get.useAuth('backend_api') ||
      localStorage.getItem('backend_api') ||
      import.meta.env.VITE_BACKEND_API_URL
    const token = get.useAuth('token')
    const res = await fetch(`${backend}/uploads/${storageKey}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!res.ok) throw new Error(`Error ${res.status}`)
    return res.blob()
  },
}
export default documentsService
