import { get } from '@/store/authstore'

const getHeaders = () => {
  const token = get.useAuth('token')
  const user = get.useAuth('user')
  const companyId = user?.companyId || user?.company?.id || null

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  if (companyId) {
    headers['X-Company-Id'] = companyId
  }

  return headers
}

export const api = {
  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const backend_api = get.useAuth('backend_api') || import.meta.env.VITE_BACKEND_API_URL

    const res = await fetch(`${backend_api}${path}`, {
     ...options,
      headers: {...getHeaders(),...(options.headers as any || {}) },
    })

    if (res.status === 401) {
      sessionStorage.clear()
      window.location.href = '/'
      throw new Error('Sesión expirada')
    }

    let data: any = null
    try {
      data = await res.json()
    } catch {
      if (!res.ok) throw new Error(`Error ${res.status}`)
      return {} as T
    }

    if (!res.ok) {
      const message = Array.isArray(data.message)
       ? data.message.join(', ')
        : data.message || data.error || 'Error desconocido'
      throw new Error(message)
    }
    return data as T
  }
}