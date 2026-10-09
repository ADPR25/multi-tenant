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
  nombre?: string;
}

export interface UserRef {
  id: string;
  nombre?: string;
  email?: string;
}

export interface ProjectPayload {
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  estado?: string;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  presupuesto?: string | null;
  avance?: number;
  clienteId?: string | null;
  responsableId?: string | null;
  [key: string]: QueryValue;
}

export interface Project {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  estado: string;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  presupuesto?: string | null;
  avance: number;
  clienteId?: string | null;
  cliente?: ThirdPartyRef | null;
  responsable?: UserRef | null;
  isActive: boolean;
  createdAt?: string;
}

export interface ProjectsResponse {
  data: Project[];
  total?: number;
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
