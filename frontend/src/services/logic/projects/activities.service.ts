import { api } from "@/services/api/api";

export interface ActivityPayload {
  projectId?: string;
  phaseId?: string;
  name?: string;
  description?: string | null;
  sortOrder?: number;
  status?: string;
  startDate?: string | null;
  endDate?: string | null;
  progress?: number;
  responsibleId?: string | null;
}

export interface Activity {
  id: string;
  projectId: string;
  phaseId: string;
  name: string;
  description: string | null;
  sortOrder: number;
  status: string;
  startDate: string | null;
  endDate: string | null;
  progress: number;
  responsibleId: string | null;
  isActive: boolean;
  createdAt?: string;
}

export const activitiesService = {
  listByProject(projectId: string) {
    return api.request<{ data: Activity[] } | Activity[]>(`/projects/activities/project/${projectId}`);
  },
  listByPhase(phaseId: string) {
    return api.request<{ data: Activity[] } | Activity[]>(`/projects/activities/phase/${phaseId}`);
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