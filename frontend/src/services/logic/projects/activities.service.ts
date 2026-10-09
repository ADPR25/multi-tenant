import { api } from "@/services/api/api";

type QueryValue = string | number | boolean | null | undefined;

export interface ActivityPayload {
  projectId?: string;
  phaseId?: string;
  nombre?: string;
  descripcion?: string | null;
  estado?: string;
  orden?: number;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  [key: string]: QueryValue;
}

export interface Activity {
  id: string;
  nombre: string;
  descripcion?: string | null;
  estado: string;
  orden: number;
  phaseId: string;
  projectId: string;
  fechaInicio?: string | null;
  fechaFin?: string | null;
}

export const activitiesService = {
  listByProject(projectId: string) {
    return api.request<Activity[]>(`/projects/activities/project/${projectId}`);
  },
  listByPhase(phaseId: string) {
    return api.request<Activity[]>(`/projects/activities/phase/${phaseId}`);
  },
  getById(id: string) {
    return api.request<Activity>(`/projects/activities/${id}`);
  },
  create(payload: ActivityPayload) {
    return api.request<Activity>("/projects/activities", { method: "POST", body: JSON.stringify(payload) });
  },
  update(id: string, payload: Partial<ActivityPayload>) {
    return api.request<Activity>(`/projects/activities/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
  },
  remove(id: string) {
    return api.request<void>(`/projects/activities/${id}`, { method: "DELETE" });
  }
};

export default activitiesService;