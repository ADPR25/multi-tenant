import { api } from "@/services/api/api";

export interface SurveyPayload {
  projectId?: string;
  titulo?: string;
  descripcion?: string | null;
  tipo?: string;
  estado?: string;
  isAnonima?: boolean;
  [key: string]: unknown;
}

export interface Survey {
  id: string;
  projectId: string;
  titulo: string;
  descripcion?: string | null;
  tipo: string;
  estado: string;
  isAnonima: boolean;
}

export interface SurveyListResponse {
  data: Survey[];
  total?: number;
}

export const surveysService = {
  listByProject(projectId: string) {
    return api.request<Survey[] | SurveyListResponse>(`/projects/surveys/project/${projectId}`);
  },
  getById(id: string) {
    return api.request<Survey>(`/projects/surveys/${id}`);
  },
  create(payload: SurveyPayload) {
    return api.request<Survey>("/projects/surveys", { method: "POST", body: JSON.stringify(payload) });
  },
  update(id: string, payload: Partial<SurveyPayload>) {
    return api.request<Survey>(`/projects/surveys/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
  },
  remove(id: string) {
    return api.request<void>(`/projects/surveys/${id}`, { method: "DELETE" });
  }
};

export default surveysService;