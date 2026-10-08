import { api } from "@/services/api/api";
import { buildQuery } from "@/services/api/buildQuery";

export type ContractTypeCode =
  | "PRESTACION_SERVICIOS"
  | "OBRA"
  | "SUMINISTRO"
  | "LABORAL"
  | "ARRIENDO"
  | "OTRO";

export type ContractStatus =
  | "BORRADOR"
  | "VIGENTE"
  | "POR_VENCER"
  | "VENCIDO"
  | "LIQUIDADO"
  | "TERMINADO"
  | "SUSPENDIDO";

export interface ContractType {
  id: string;
  code: ContractTypeCode;
  name: string;
  requiresPolicy: boolean;
  isActive: boolean;
}

export interface ContractThirdParty {
  id: string;
  type: "NATURAL" | "JURIDICA" | "EMPLEADO";
  name: string;
  legalName?: string | null;
  taxId: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  contactPerson?: string | null;
  riskLevel: "BAJO" | "MEDIO" | "ALTO";
  isActive: boolean;
}

export interface ContractRecord {
  id: string;
  title: string;
  contractNumber: string;
  object: string;
  status: ContractStatus;
  totalValue: string;
  startDate: string;
  endDate: string;
  contractType: ContractType;
  thirdParty: ContractThirdParty;
}

export interface ContractQuery {
  search?: string;
  page?: number;
  limit?: number | string;
  [key: string]: string | number | boolean | null | undefined;
}

interface ContractPage<T> {
  data: T[];
  total: number;
  [key: string]: unknown;
}

export interface ContractPayload {
  title: string;
  contractTypeId: string;
  thirdPartyId: string;
  object: string;
  totalValue: number;
  startDate: string;
  endDate: string;
  signatureDate?: string;
  paymentTerms?: "MENSUAL" | "UNICO" | "POR_HITOS" | "TRIMESTRAL";
  status?: ContractStatus;
}

export type ThirdPartyPayload = Omit<
  ContractThirdParty,
  "id" | "isActive" | "riskLevel"
> & { riskLevel?: ContractThirdParty["riskLevel"] };

export const contractingService = {
  listContracts(query?: ContractQuery) {
    return api.request<ContractPage<ContractRecord>>(
      `/contracting/contracts${buildQuery(query)}`,
    );
  },
  createContract(payload: ContractPayload) {
    return api.request<ContractRecord>("/contracting/contracts", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  listThirdParties(query?: ContractQuery) {
    return api.request<ContractPage<ContractThirdParty>>(
      `/contracting/third-parties${buildQuery(query)}`,
    );
  },
  createThirdParty(payload: ThirdPartyPayload) {
    return api.request<ContractThirdParty>("/contracting/third-parties", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  listTypes() {
    return api.request<ContractType[]>("/contracting/types");
  },
  updateType(id: string, payload: Partial<Pick<ContractType, "name" | "requiresPolicy" | "isActive">>) {
    return api.request<ContractType>(`/contracting/types/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
};