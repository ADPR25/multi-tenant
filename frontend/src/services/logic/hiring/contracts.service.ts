import { api } from "@/services/api/api";
import { buildQuery } from "@/services/api/buildQuery";

type QueryValue = string | number | boolean | null | undefined;

export interface ContractQuery {
  search?: string;
  page?: number;
  limit?: number | string;
  state?: boolean;
  [key: string]: QueryValue;
}

export interface ContractPayload {
  codigo?: string;
  numeroContrato?: string;
  thirdPartyId?: string;
  supervisorId?: string;
  objeto?: string;
  observacion?: string;
  montoTotal?: string;
  montoPrimerPago?: string;
  vecesPagadas?: number;
  fechaInicio?: string;
  fechaCierre?: string;
  proyectoNombre?: string;
  proyectoId?: string;
  [key: string]: QueryValue;
}

export interface Contract {
  id: string;
  codigo: string;
  numeroContrato: string;
  thirdPartyId: string;
  supervisorId?: string | null;
  objeto: string;
  observacion?: string | null;
  montoTotal: string;
  montoPrimerPago?: string | null;
  vecesPagadas: number;
  fechaInicio: string;
  fechaCierre?: string | null;
  proyectoNombre?: string | null;
  proyectoId?: string | null;
  isActive: boolean;
}

export interface ContractsResponse {
  data: Contract[];
  total?: number;
}

export interface Requirement {
  id: string;
  contractId: string;
  descripcion: string;
}
export interface Obligation {
  id: string;
  contractId: string;
  descripcion: string;
}
export interface Addendum {
  id: string;
  contractId: string;
  descripcion: string;
}

export const contractsService = {
  list(p?: ContractQuery) {
    return api.request<ContractsResponse>(`/hiring/contracts${buildQuery(p)}`);
  },
  getById(id: string) {
    return api.request<Contract>(`/hiring/contracts/${id}`);
  },
  create(payload: ContractPayload) {
    return api.request<Contract>("/hiring/contracts", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  update(id: string, payload: Partial<ContractPayload>) {
    return api.request<Contract>(`/hiring/contracts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  toggleActive(id: string) {
    return api.request<Contract>(`/hiring/contracts/active/${id}`, {
      method: "PATCH",
    });
  },
  remove(id: string) {
    return api.request<void>(`/hiring/contracts/${id}`, { method: "DELETE" });
  },
  // extras
  requirements(contractId: string) {
    return api.request<Requirement[]>(
      `/hiring/requirements/contract/${contractId}`,
    );
  },
  obligations(contractId: string) {
    return api.request<Obligation[]>(
      `/hiring/obligations/contract/${contractId}`,
    );
  },
  addendums(contractId: string) {
    return api.request<Addendum[]>(`/hiring/addendums/contract/${contractId}`);
  },
};

export default contractsService;
