import { api } from "@/services/api/api";
import { buildQuery } from "@/services/api/buildQuery";

export interface ThirdPartyQuery {
  search?: string;
  tipo?: string;
  page?: number;
  limit?: number | string;
  state?: boolean;
  find?: string;
  [key: string]: unknown;
}
export interface ThirdPartyPayload {
  nit: string;
  dv?: string;
  razonSocial: string;
  nombreComercial?: string;
  tipo: string;
  tipoPersona?: string;
  email?: string;
  telefono?: string;
  ciudad?: string;
  direccion?: string;
  banco?: string;
  tipoCuenta?: string;
  cuentaBancaria?: string;
  actividadEconomica?: string;
  responsableIva?: boolean;
  notas?: string;
  [key: string]: unknown;
}
export interface ThirdParty {
  id: string;
  nit: string;
  razonSocial: string;
  tipo: string;
  email?: string;
  telefono?: string;
  isActive: boolean;
  [key: string]: unknown;
}
export interface ThirdPartiesResponse { data: ThirdParty[]; total?: number; [key: string]: unknown; }

export const thirdPartiesService = {
  list(p?: ThirdPartyQuery) {
    return api.request<ThirdPartiesResponse>(`/third-parties${buildQuery(p)}`);
  },
  listSelect(tipo?: string) {
    return api.request<ThirdParty[]>(`/third-parties/select/all${buildQuery({ tipo })}`);
  },
  getById(id: string) {
    return api.request<ThirdParty>(`/third-parties/${id}`);
  },
  create(payload: ThirdPartyPayload) {
    return api.request<ThirdParty>("/third-parties", { method: "POST", body: JSON.stringify(payload) });
  },
  update(id: string, payload: Partial<ThirdPartyPayload>) {
    return api.request<ThirdParty>(`/third-parties/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
  },
  toggleActive(id: string) {
    return api.request<ThirdParty>(`/third-parties/active/${id}`, { method: "PATCH" });
  }
};
export default thirdPartiesService;