export default defineNuxtPlugin(() => {
  const auth = useAuthStore();

  if (process.client) {
    const token = localStorage.getItem('token');
    if (token) {
      auth.token = token;
      const tenant = localStorage.getItem('tenant');
      if (tenant) {
        try { auth.currentTenant = JSON.parse(tenant); } catch {}
      }
    }
  }
});
