export default defineNuxtRouteMiddleware(async (to, from) => {
  // Only apply for admin routes
  if (!to.path.startsWith('/admin')) return;

  const auth = useAuthStore();

  // If no token, require login
  if (!auth.token) return navigateTo('/admin/login');

  // If we have a token but not user data, try to fetch it
  if (auth.token && !auth.user) {
    try {
      await auth.fetchUser();
    } catch (e) {
      // fetchUser handles logout for 401/403; other errors will set authError in store
    }
  }

  // If still no user, redirect to login (token likely invalid)
  if (!auth.user) return navigateTo('/admin/login');

  // All good: allow navigation
});
