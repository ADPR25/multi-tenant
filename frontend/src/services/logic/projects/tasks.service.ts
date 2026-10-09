import { api } from "@/services/api/api";
import { buildQuery } from "@/services/api/buildQuery";

type QueryValue = string | number | boolean | null | undefined;
type TaskQuery = Record<string, QueryValue>;

export interface TaskPayload {
  projectId?: string;
  phaseId?: string | null;
  activityId?: string;
  titulo?: string;
  descripcion?: string | null;
  estado?: string;
  prioridad?: string;
  fechaVencimiento?: string | null;
  horasEstimadas?: string | null;
  orden?: number;
  [key: string]: QueryValue;
}

export interface Task {
  id: string;
  titulo: string;
  descripcion?: string | null;
  estado: string;
  prioridad: string;
  activityId: string;
  phaseId?: string | null;
  projectId: string;
  orden: number;
  fechaVencimiento?: string | null;
  horasEstimadas?: string | null;
  isActive?: boolean;
}

export interface TaskListResponse {
  data: Task[];
  total?: number;
}

export const tasksService = {
  listByProject(projectId: string, query?: TaskQuery) {
    return api.request<Task[] | TaskListResponse>(
      `/projects/tasks/project/${projectId}${buildQuery(query)}`,
    );
  },
  getById(id: string) {
    return api.request<Task>(`/projects/tasks/${id}`);
  },
  create(payload: TaskPayload) {
    return api.request<Task>("/projects/tasks", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  update(id: string, payload: Partial<TaskPayload>) {
    return api.request<Task>(`/projects/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  toggleActive(id: string) {
    return api.request<Task>(`/projects/tasks/active/${id}`, {
      method: "PATCH",
    });
  },
  remove(id: string) {
    return api.request<void>(`/projects/tasks/${id}`, { method: "DELETE" });
  },
};

export default tasksService;
