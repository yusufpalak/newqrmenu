import { useAuthStore } from '~/stores/auth';

export interface IApiClient {
  get<T = unknown>(url: string): Promise<T>;
  post<T = unknown, B = unknown>(url: string, body: B): Promise<T>;
  patch<T = unknown, B = unknown>(url: string, body: B): Promise<T>;
  delete<T = unknown>(url: string): Promise<T>;
  upload<T = unknown>(url: string, formData: FormData): Promise<T>;
}

export function useApi(): IApiClient {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();

  const baseUrl = (): string => `${config.public.apiBase}/api`;

  const headers = (): Record<string, string> => {
    const h: Record<string, string> = {};
    if (authStore.token) h['Authorization'] = `Bearer ${authStore.token}`;
    if (authStore.currentTenant) h['x-tenant-id'] = authStore.currentTenant.id;
    return h;
  };

  return {
    get<T = unknown>(url: string): Promise<T> {
      return $fetch<T>(`${baseUrl()}${url}`, {
        method: 'GET',
        headers: headers(),
      });
    },
    post<T = unknown, B = unknown>(url: string, body: B): Promise<T> {
      return $fetch<T>(`${baseUrl()}${url}`, {
        method: 'POST',
        headers: headers(),
        body: body as Record<string, unknown>,
      });
    },
    patch<T = unknown, B = unknown>(url: string, body: B): Promise<T> {
      return $fetch<T>(`${baseUrl()}${url}`, {
        method: 'PATCH',
        headers: headers(),
        body: body as Record<string, unknown>,
      });
    },
    delete<T = unknown>(url: string): Promise<T> {
      return $fetch<T>(`${baseUrl()}${url}`, {
        method: 'DELETE',
        headers: headers(),
      });
    },
    upload<T = unknown>(url: string, formData: FormData): Promise<T> {
      return $fetch<T>(`${baseUrl()}${url}`, {
        method: 'POST',
        headers: headers(),
        body: formData,
      });
    },
  };
}
