import { api } from "@/services/api/api";
import { buildQuery } from "@/services/api/buildQuery";

export const productVariantsService = {
  list(params?: { productId?: string; search?: string }) {
    return api.request<any>(`/product-variants${buildQuery(params)}`)
  },
  getById(id: string) {
    return api.request<any>(`/product-variants/${id}`)
  },
  get(id: string) {
    return api.request<any>(`/product-variants/${id}`)
  },
  create(payload: any) {
    return api.request<any>('/product-variants', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  update(id: string, payload: any) {
    return api.request<any>(`/product-variants/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
  remove(id: string) {
    return api.request<any>(`/product-variants/${id}`, { method: 'DELETE' })
  },
}
export default productVariantsService
