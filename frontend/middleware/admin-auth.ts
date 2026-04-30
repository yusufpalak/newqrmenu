import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/admin')) return;

  const auth = useAuthStore();

  if (!auth.token) return navigateTo('/admin/login');

  if (auth.token && !auth.user) {
    try {
      await auth.fetchUser();
    } catch {
      /* fetchUser handles auth errors */
    }
  }

  if (!auth.user) return navigateTo('/admin/login');
});
