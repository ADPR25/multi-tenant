import { api } from "@/services/api/api";
import { buildQuery } from "@/services/api/buildQuery";

export interface DocumentTypeQuery {
  search?: string;
  page?: number;
  limit?: number | string;
  isActive?: boolean;
  [key: string]: unknown;
}

export interface DocumentTypePayload {
  name: string;
  description?: string;
  isActive?: boolean;
  [key: string]: unknown;
}

export interface DocumentType {
  id: string;
  name: string;
  isActive: boolean;
  [key: string]: unknown;
}

export interface DocumentTypesResponse {
  data: DocumentType[];
  total?: number;
  [key: string]: unknown;
}

export const documentTypesService = {
  list(p?: DocumentTypeQuery) {
    return api.request<DocumentTypesResponse>(
      `/document_management/documents/types${buildQuery(p)}`,
    );
  },
  getById(id: string) {
    return api.request<DocumentType>(
      `/document_management/documents/types/${id}`,
    );
  },
  create(payload: DocumentTypePayload) {
    return api.request<DocumentType>("/document_management/documents/types", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  update(id: string, payload: Partial<DocumentTypePayload>) {
    return api.request<DocumentType>(
      `/document_management/documents/types/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    );
  },
  toggleActive(id: string) {
    return api.request<DocumentType>(
      `/document_management/documents/types/active/${id}`,
      {
        method: "PATCH",
      },
    );
  },
};

export const typeDocumentsService = documentTypesService;
export default documentTypesService;
