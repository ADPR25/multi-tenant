import { api } from "@/services/api/api";
import { buildQuery, type QueryValue } from "@/services/api/buildQuery";

export type ThirdPartyType =
  "CLIENT" | "SUPPLIER" | "CONTRACTOR" | "EMPLOYEE" | "BOTH";
export type ThirdPartyPersonType = "INDIVIDUAL" | "LEGAL_ENTITY";
export type BankAccountType = "SAVINGS" | "CHECKING";

export interface ThirdPartyQuery extends Record<string, QueryValue> {
  search?: string;
  type?: string;
  page?: number;
  limit?: number | string;
  isActive?: boolean;
}

export interface ThirdPartyPayload {
  taxId: string;
  verificationDigit?: string | null;
  legalName: string;
  tradeName?: string | null;
  type: ThirdPartyType;
  personType?: ThirdPartyPersonType;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  address?: string | null;
  bankName?: string | null;
  bankAccountType?: BankAccountType | null;
  bankAccountNumber?: string | null;
  economicActivity?: string | null;
  isVatResponsible?: boolean;
  notes?: string | null;
}

export interface ThirdParty {
  id: string;
  taxId: string;
  verificationDigit: string | null;
  legalName: string;
  tradeName: string | null;
  type: ThirdPartyType;
  personType: ThirdPartyPersonType;
  email: string | null;
  phone: string | null;
  city: string | null;
  address: string | null;
  bankName: string | null;
  bankAccountType: BankAccountType | null;
  bankAccountNumber: string | null;
  economicActivity: string | null;
  isVatResponsible: boolean;
  notes: string | null;
  isActive: boolean;
  createdAt?: string;
}

export interface ThirdPartiesResponse {
  data: ThirdParty[];
  total?: number;
}

export const thirdPartiesService = {
  list(p?: ThirdPartyQuery) {
    return api.request<ThirdPartiesResponse>(`/third-parties${buildQuery(p)}`);
  },
  listSelect(type?: ThirdPartyType) {
    return api.request<ThirdParty[]>(
      `/third-parties/select/all${buildQuery({ type })}`,
    );
  },
  getById(id: string) {
    return api.request<ThirdParty>(`/third-parties/${id}`);
  },
  create(payload: ThirdPartyPayload) {
    return api.request<ThirdParty>("/third-parties", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  update(id: string, payload: Partial<ThirdPartyPayload>) {
    return api.request<ThirdParty>(`/third-parties/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  toggleActive(id: string) {
    return api.request<ThirdParty>(`/third-parties/active/${id}`, {
      method: "PATCH",
    });
  },
};
export default thirdPartiesService;
