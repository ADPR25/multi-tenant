import { api } from '@/services/api/api'
import { buildQuery } from '@/services/api/buildQuery'

export interface FolderQuery {
  search?: string
  parentId?: string
  page?: number
  limit?: number | string
  isActive?: boolean
  [key: string]: unknown
}

export interface FolderPayload {
  name: string
  parentId?: string | null
  description?: string
  isActive?: boolean
  [key: string]: unknown
}

export interface PersonalFolderPayload {
  parentId: string
}

export interface Folder {
  id: string
  name: string
  parentId?: string | null
  isActive: boolean
  [key: string]: unknown
}

export interface FoldersResponse {
  data: Folder[]
  total?: number
  [key: string]: unknown
}

export const foldersService = {
  list(p?: FolderQuery) {
    return api.request<FoldersResponse>(`/document_management/folders${buildQuery(p)}`)
  },
  getById(id: string) {
    return api.request<Folder>(`/document_management/folders/${id}`)
  },
  create(payload: FolderPayload) {
    return api.request<Folder>('/document_management/folders', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  createPersonal(payload: PersonalFolderPayload) {
    return api.request<Folder>('/document_management/folders/personal', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  update(id: string, payload: Partial<FolderPayload>) {
    return api.request<Folder>(`/document_management/folders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
  toggleActive(id: string) {
    return api.request<Folder>(`/document_management/folders/active/${id}`, { method: 'PATCH' })
  },
}

export default foldersService
