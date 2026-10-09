import { api } from "@/services/api/api";

type QueryValue = string | number | boolean | null | undefined;

export interface RequirementPayload {
  contractId?: string;
  descripcion?: string;
  esObligatorio?: boolean;
  [key: string]: QueryValue;
}

export interface Requirement {
  id: string;
  contractId: string;
  descripcion: string;
  esObligatorio: boolean;
}

export interface ObligationPayload {
  contractId?: string;
  descripcion?: string;
  tipo?: string;
  [key: string]: QueryValue;
}

export interface Obligation {
  id: string;
  contractId: string;
  descripcion: string;
  tipo: string;
}

export interface AddendumPayload {
  contractId?: string;
  descripcion?: string;
  montoAdicional?: string | null;
  fechaAdicion?: string | null;
  [key: string]: QueryValue;
}

export interface Addendum {
  id: string;
  contractId: string;
  descripcion: string;
  montoAdicional?: string | null;
  fechaAdicion?: string | null;
}

export const requirementsService = {
  listByContract(contractId: string) {
    return api.request<Requirement[]>(
      `/hiring/requirements/contract/${contractId}`,
    );
  },
  create(p: RequirementPayload) {
    return api.request<Requirement>("/hiring/requirements", {
      method: "POST",
      body: JSON.stringify(p),
    });
  },
  update(id: string, p: Partial<RequirementPayload>) {
    return api.request<Requirement>(`/hiring/requirements/${id}`, {
      method: "PATCH",
      body: JSON.stringify(p),
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
  create(p: ObligationPayload) {
    return api.request<Obligation>("/hiring/obligations", {
      method: "POST",
      body: JSON.stringify(p),
    });
  },
  update(id: string, p: Partial<ObligationPayload>) {
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
  create(p: AddendumPayload) {
    return api.request<Addendum>("/hiring/addendums", {
      method: "POST",
      body: JSON.stringify(p),
    });
  },
  remove(id: string) {
    return api.request<void>(`/hiring/addendums/${id}`, { method: "DELETE" });
  },
};
