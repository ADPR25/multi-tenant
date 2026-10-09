import { api } from "@/services/api/api";

type QueryValue = string | number | boolean | null | undefined;

export interface PhasePayload {
  projectId?: string;
  codigo?: string;
  nombre?: string;
  descripcion?: string | null;
  orden?: number;
  estado?: string;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  presupuesto?: string | null;
  [key: string]: QueryValue;
}

export interface Phase {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  orden: number;
  estado: string;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  presupuesto?: string | null;
  avance?: number;
  projectId: string;
}

export const phasesService = {
  listByProject(projectId: string) {
    return api.request<Phase[]>(`/projects/phases/project/${projectId}`);
  },
  getById(id: string) {
    return api.request<Phase>(`/projects/phases/${id}`);
  },
  create(payload: PhasePayload) {
    return api.request<Phase>("/projects/phases", { method: "POST", body: JSON.stringify(payload) });
  },
  update(id: string, payload: Partial<PhasePayload>) {
    return api.request<Phase>(`/projects/phases/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
  },
  remove(id: string) {
    return api.request<void>(`/projects/phases/${id}`, { method: "DELETE" });
  }
};

export default phasesService;