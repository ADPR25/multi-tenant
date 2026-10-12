import { api } from "@/services/api/api";
import { buildQuery, type QueryValue } from "@/services/api/buildQuery";

export interface ContractQuery extends Record<string, QueryValue> {
  search?: string;
  page?: number;
  limit?: number | string;
  find?: string;
}
export interface ContractPayload {
  code: string;
  contractNumber?: string | null;
  thirdPartyId: string;
  supervisorId?: string | null;
  purpose: string;
  observation?: string | null;
  totalAmount: string;
  firstPaymentAmount?: string | null;
  timesPaid?: number;
  startDate: string;
  endDate?: string | null;
  projectId?: string | null;
}
export interface Contract {
  id: string;
  code: string;
  contractNumber: string | null;
  thirdPartyId: string;
  thirdParty?: { id: string; legalName: string } | null;
  purpose: string;
  totalAmount: string;
  status: string;
  isActive: boolean;
  projectId: string | null;
  startDate: string;
  endDate: string | null;
  observation: string | null;
  firstPaymentAmount: string | null;
  timesPaid: number;
}
export interface ContractsResponse {
  data: Contract[];
  total?: number;
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
  changeStatus(id: string, status: string) {
    return api.request<Contract>(`/hiring/contracts/${id}/status/${status}`, {
      method: "PATCH",
    });
  },
  remove(id: string) {
    return api.request<void>(`/hiring/contracts/${id}`, { method: "DELETE" });
  },
};
