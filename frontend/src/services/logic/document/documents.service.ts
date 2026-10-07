import { api } from "@/services/api/api";
import { buildQuery } from "@/services/api/buildQuery";
import { get } from "@/store/authstore";

export interface DocumentQuery {
  search?: string;
  folderId?: string;
  typeId?: string;
  page?: number;
  limit?: number | string;
  isActive?: boolean;
  [key: string]: unknown;
}

export interface DocumentPayload {
  name: string;
  folderId?: string;
  typeId?: string;
  description?: string;
  storageKey?: string;
  isActive?: boolean;
  [key: string]: unknown;
}

export interface Document {
  id: string;
  name: string;
  storageKey: string;
  folderId?: string;
  isActive: boolean;
  [key: string]: unknown;
}

export interface DocumentsResponse {
  data: Document[];
  total?: number;
  [key: string]: unknown;
}

export const documentsService = {
  list(p?: DocumentQuery) {
    return api.request<DocumentsResponse>(
      `/document_management/documents/docs${buildQuery(p)}`,
    );
  },
  getById(id: string) {
    return api.request<Document>(`/document_management/documents/docs/${id}`);
  },
  create(payload: DocumentPayload) {
    return api.request<Document>("/document_management/documents/docs", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  upload(formData: FormData) {
    return api.request<Document>("/document_management/documents/docs/upload", {
      method: "POST",
      body: formData,
    });
  },
  update(id: string, payload: Partial<DocumentPayload>) {
    return api.request<Document>(`/document_management/documents/docs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  toggleActive(id: string) {
    return api.request<Document>(
      `/document_management/documents/docs/active/${id}`,
      {
        method: "PATCH",
      },
    );
  },
  delete(id: string) {
    return api.request<{ success: boolean }>(
      `/document_management/documents/docs/${id}`,
      {
        method: "DELETE",
      },
    );
  },
  downloadUrl(storageKey: string, withToken = true) {
    const backend =
      (get.useAuth("backend_api") as string | null) ||
      localStorage.getItem("backend_api") ||
      import.meta.env.VITE_BACKEND_API_URL;

    const token = get.useAuth("token") as string | null;

    if (withToken && token) {
      return `${backend as string}/uploads/${storageKey}?token=${String(token)}`;
    }
    return `${backend as string}/uploads/${storageKey}`;
  },
  async downloadBlob(storageKey: string): Promise<Blob> {
    const backend =
      (get.useAuth("backend_api") as string | null) ||
      localStorage.getItem("backend_api") ||
      import.meta.env.VITE_BACKEND_API_URL;

    const token = get.useAuth("token") as string | null;

    const res = await fetch(`${backend as string}/uploads/${storageKey}`, {
      headers: token ? { Authorization: `Bearer ${String(token)}` } : {},
    });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.blob();
  },
};

export default documentsService;
