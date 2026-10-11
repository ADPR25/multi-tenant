import { api } from "@/services/api/api";

export interface PhasePayload {
  projectId?: string;
  code?: string;
  name?: string;
  description?: string | null;
  sortOrder?: number;
  status?: string;
  startDate?: string | null;
  endDate?: string | null;
  budget?: string | null;
  progress?: number;
}

export interface Phase {
  id: string;
  projectId: string;
  code: string;
  name: string;
  description: string | null;
  sortOrder: number;
  status: string;
  startDate: string | null;
  endDate: string | null;
  budget: string | null;
  progress: number;
  isActive: boolean;
  createdAt?: string;
}

export const phasesService = {
  listByProject(projectId: string) {
    return api.request<{ data: Phase[] } | Phase[]>(`/projects/phases/project/${projectId}`);
  },
  getById(id: string) {
    return api.request<Phase>(`/projects/phases/${id}`);
  },
  create(payload: PhasePayload) {
    return api.request<Phase>("/projects/phases", { 
      method: "POST", 
      body: JSON.stringify(payload) 
    });
  },
  update(id: string, payload: Partial<PhasePayload>) {
    return api.request<Phase>(`/projects/phases/${id}`, { 
      method: "PATCH", 
      body: JSON.stringify(payload) 
    });
  },
  remove(id: string) {
    return api.request<void>(`/projects/phases/${id}`, { method: "DELETE" });
  }
};

export default phasesService;