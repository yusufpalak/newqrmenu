export function useApi() {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();

  const api = {
    async get(url) {
      return $fetch(`${config.public.apiBase}/api${url}`, {
        method: 'GET',
        headers: authStore.token ? {
          Authorization: `Bearer ${authStore.token}`,
        } : {},
      });
    },

    async post(url, body) {
      return $fetch(`${config.public.apiBase}/api${url}`, {
        method: 'POST',
        headers: authStore.token ? {
          Authorization: `Bearer ${authStore.token}`,
        } : {},
        body,
      });
    },

    async patch(url, body) {
      return $fetch(`${config.public.apiBase}/api${url}`, {
        method: 'PATCH',
        headers: authStore.token ? {
          Authorization: `Bearer ${authStore.token}`,
        } : {},
        body,
      });
    },

    async upload(url, formData) {
      return $fetch(`${config.public.apiBase}/api${url}`, {
        method: 'POST',
        headers: authStore.token ? {
          Authorization: `Bearer ${authStore.token}`,
        } : {},
        body: formData,
      });
    },

    async delete(url) {
      return $fetch(`${config.public.apiBase}/api${url}`, {
        method: 'DELETE',
        headers: authStore.token ? {
          Authorization: `Bearer ${authStore.token}`,
        } : {},
      });
    },
  };

  return api;
}
