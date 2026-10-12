import { api } from "@/services/api/api";

export interface Requirement {
  id: string;
  contractId: string;
  name: string;
  isRequired: boolean;
  isDelivered: boolean;
  observation?: string | null;
}
export interface Obligation {
  id: string;
  contractId: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
}
export interface Addendum {
  id: string;
  contractId: string;
  type: "AMENDMENT" | "EXTENSION" | "ADDITION";
  description: string;
  additionalAmount?: string | null;
  additionalDays?: number | null;
  startDate?: string | null;
}

export const requirementsService = {
  listByContract(contractId: string) {
    return api.request<Requirement[]>(
      `/hiring/requirements/contract/${contractId}`,
    );
  },
  create(p: {
    contractId: string;
    name: string;
    isRequired?: boolean;
    observation?: string;
  }) {
    return api.request<Requirement>("/hiring/requirements", {
      method: "POST",
      body: JSON.stringify(p),
    });
  },
  toggle(id: string) {
    return api.request<Requirement>(`/hiring/requirements/${id}/toggle`, {
      method: "PATCH",
    });
  },
  remove(id: string) {
    return api.request<void>(`/hiring/requirements/${id}`, {
      method: "DELETE",
    });
  },
};
export const obligationsService = {
  listByContract(contractId: string) {
    return api.request<Obligation[]>(
      `/hiring/obligations/contract/${contractId}`,
    );
  },
  create(p: { contractId: string; description: string; sortOrder?: number }) {
    return api.request<Obligation>("/hiring/obligations", {
      method: "POST",
      body: JSON.stringify(p),
    });
  },
  update(id: string, p: { description?: string }) {
    return api.request<Obligation>(`/hiring/obligations/${id}`, {
      method: "PATCH",
      body: JSON.stringify(p),
    });
  },
  remove(id: string) {
    return api.request<void>(`/hiring/obligations/${id}`, { method: "DELETE" });
  },
};
export const addendumsService = {
  listByContract(contractId: string) {
    return api.request<Addendum[]>(`/hiring/addendums/contract/${contractId}`);
  },
  create(p: {
    contractId: string;
    type: string;
    description: string;
    additionalAmount?: string;
    additionalDays?: number;
  }) {
    return api.request<Addendum>("/hiring/addendums", {
      method: "POST",
      body: JSON.stringify(p),
    });
  },
  remove(id: string) {
    return api.request<void>(`/hiring/addendums/${id}`, { method: "DELETE" });
  },
};
