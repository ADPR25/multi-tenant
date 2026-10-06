export type QueryValue = string | number | boolean | null | undefined

export const buildQuery = (params?: Record<string, QueryValue>) => {
  if (!params) return ''
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.append(k, String(v))
  })
  const str = qs.toString()
  return str ? `?${str}` : ''
}
