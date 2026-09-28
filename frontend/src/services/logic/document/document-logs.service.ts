import { api } from "@/services/api/api";
import { buildQuery } from "@/services/api/buildQuery";

export const documentLogsService = {
  list(params?: any) {
    return api.request<any>(`/docs/audit-logs${buildQuery(params)}`)
  },
  byDocument(documentId: string) {
    return api.request<any>(`/docs/audit-logs/document/${documentId}`)
  },
}
export default documentLogsService
