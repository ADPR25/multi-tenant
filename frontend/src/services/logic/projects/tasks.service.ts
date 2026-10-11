import { api } from "@/services/api/api";
import { buildQuery } from "@/services/api/buildQuery";

type QueryValue = string | number | boolean | null | undefined;
type TaskQuery = Record<string, QueryValue>;

export interface TaskPayload {
  projectId?: string;
  phaseId?: string | null;
  activityId?: string;
  title?: string;
  description?: string | null;
  status?: string;
  priority?: string;
  dueDate?: string | null;
  estimatedHours?: string | null;
  actualHours?: string | null;
  sortOrder?: number;
  responsibleId?: string | null;
  surveyId: string
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  projectId: string;
  phaseId: string | null;
  activityId: string;
  dueDate: string | null;
  estimatedHours: string | null;
  actualHours: string | null;
  sortOrder: number;
  responsibleId: string | null;
  isActive: boolean;
  surveyId: string;
  createdAt?: string;
}

export interface TaskListResponse {
  data: Task[];
  total?: number;
}

export const tasksService = {
  listByProject(projectId: string, query?: TaskQuery) {
    return api.request<{ data: Task[] } | Task[] | TaskListResponse>(
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