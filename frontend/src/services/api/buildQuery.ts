export const buildQuery = (params?: any) => {
  if (!params) return ''
  const clean: Record<string, string> = {}
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '' && v !== 'undefined' && String(v).trim() !== '')
      clean[k] = String(v)
  })
  const qs = new URLSearchParams(clean).toString()
  return qs ? `?${qs}` : ''
}
