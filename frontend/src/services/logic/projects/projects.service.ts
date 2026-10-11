import { api } from "@/services/api/api";
import { buildQuery } from "@/services/api/buildQuery";

type QueryValue = string | number | boolean | null | undefined;

export interface ProjectQuery {
  search?: string;
  page?: number;
  limit?: number | string;
  isActive?: boolean;
  [key: string]: QueryValue;
}

export interface ThirdPartyRef {
  id: string;
  razonSocial?: string;
  businessName?: string;
  name?: string;
  nit?: string;
}

export interface UserRef {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface ProjectPayload {
  code: string;
  name: string;
  description?: string | null;
  status?: string;
  startDate?: string | null;
  endDate?: string | null;
  budget?: string | null;
  progress?: number;
  clientId?: string | null;
  responsibleId?: string | null;
}

export interface Project {
  id: string;
  companyId?: string;
  code: string;
  name: string;
  description?: string | null;
  status: string;
  startDate?: string | null;
  endDate?: string | null;
  budget?: string | null;
  progress: number;
  clientId: string | null;
  responsibleId: string | null;
  client?: ThirdPartyRef | null;
  responsible?: UserRef | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectsResponse {
  data: Project[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export const projectsService = {
  list(p?: ProjectQuery) {
    return api.request<ProjectsResponse>(`/projects${buildQuery(p)}`);
  },
  getById(id: string) {
    return api.request<Project>(`/projects/${id}`);
  },
  create(payload: ProjectPayload) {
    return api.request<Project>("/projects", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  update(id: string, payload: Partial<ProjectPayload>) {
    return api.request<Project>(`/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  toggleActive(id: string) {
    return api.request<Project>(`/projects/active/${id}`, { method: "PATCH" });
  },
  remove(id: string) {
    return api.request<{ message: string }>(`/projects/${id}`, {
      method: "DELETE",
    });
  },
};

export default projectsService;