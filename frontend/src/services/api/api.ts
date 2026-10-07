import { get } from "@/store/authstore";

const getHeaders = (): Record<string, string> => {
  const token = get.useAuth("token") as string | null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${String(token)}`;
  return headers;
};

export const api = {
  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const backend_api =
      (get.useAuth("backend_api") as string | null) ||
      import.meta.env.VITE_BACKEND_API_URL;
    const isForm = options.body instanceof FormData;

    const baseHeaders = getHeaders();
    const customHeaders = (options.headers as Record<string, string>) || {};
    const finalHeaders: Record<string, string> = {
      ...baseHeaders,
      ...customHeaders,
    };

    if (isForm) delete finalHeaders["Content-Type"];

    const res = await fetch(`${backend_api as string}${path}`, {
      ...options,
      headers: finalHeaders,
    });

    const isLoginRequest = path.includes("/auth/login");

    if (res.status === 401 && !isLoginRequest) {
      sessionStorage.clear();
      window.location.href = "/";
      throw new Error("Sesión expirada");
    }

    let data: unknown;
    try {
      data = (await res.json()) as unknown;
    } catch {
      if (!res.ok) throw new Error(`Error ${res.status}`);
      return {} as T;
    }

    if (!res.ok) {
      const parsed = data as { message?: string | string[]; error?: string };
      const message = Array.isArray(parsed.message)
        ? parsed.message.join(", ")
        : parsed.message || parsed.error || "Error desconocido";
      throw new Error(message);
    }

    return data as T;
  },
};
