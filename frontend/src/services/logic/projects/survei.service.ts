import { api } from "@/services/api/api";

export interface SurveyPayload {
  title: string;
  description?: string | null;
  endDate: string;
  projectId?: string;
  isActive?: boolean;
  [key: string]: unknown;
}

export interface Survey {
  id: string;
  companyId: string;
  title: string;
  description?: string | null;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SurveyFetchParams {
  search?: string;
  page?: number;
  limit?: number | string;
  state?: boolean | string;
  isActive?: boolean | string;
  [key: string]: unknown;
}

export interface FetchResponse<T> {
  data: T[];
  total?: number;
  [key: string]: unknown;
}

function buildQuery(params: SurveyFetchParams) {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  if (params.search) q.set("search", String(params.search));
  if (params.state !== undefined) q.set("state", String(params.state));
  if (params.isActive !== undefined) {
    q.set("state", String(params.isActive));
  }
  return q.toString() ? `?${q.toString()}` : "";
}

export const surveysService = {
  list(params: SurveyFetchParams): Promise<FetchResponse<Survey>> {
    return api.request<FetchResponse<Survey>>(`/projects/surveys${buildQuery(params)}`);
  },

  getById(id: string) {
    return api.request<Survey>(`/projects/surveys/${id}`);
  },

  create(payload: SurveyPayload) {
    return api.request<Survey>(`/projects/surveys`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update(id: string, payload: Partial<SurveyPayload>) {
    return api.request<Survey>(`/projects/surveys/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  remove(id: string) {
    return api.request<void>(`/projects/surveys/${id}`, {
      method: "DELETE",
    });
  },
};

export default surveysService;