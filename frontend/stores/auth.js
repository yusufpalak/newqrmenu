import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    currentTenant: null,
    authError: null,
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'ADMIN' || state.user?.role === 'SUPERADMIN',
    isSuperAdmin: (state) => state.user?.role === 'SUPERADMIN',
  },
  
  actions: {
    init() {
      // Load token from localStorage on initialization
      if (process.client) {
        const token = localStorage.getItem('token');
        if (token) {
          this.token = token;
          this.fetchUser();
          const tenant = localStorage.getItem('tenant');
          if (tenant) this.currentTenant = JSON.parse(tenant);
        }
      }
    },
    
    setToken(token) {
      this.token = token;
      if (process.client) {
        localStorage.setItem('token', token);
      }
    },
    
    setUser(user) {
      this.user = user;
    },
    setTenant(tenant) {
      this.currentTenant = tenant;
      if (process.client) {
        localStorage.setItem('tenant', JSON.stringify(tenant));
      }
    },
    clearTenant() {
      this.currentTenant = null;
      if (process.client) {
        localStorage.removeItem('tenant');
      }
    },
    setAuthError(msg) {
      this.authError = msg;
    },
    clearAuthError() {
      this.authError = null;
    },
    
    logout() {
      this.user = null;
      this.token = null;
      if (process.client) {
        localStorage.removeItem('token');
      }
      navigateTo('/admin/login');
    },
    
    async login(email, password) {
      const config = useRuntimeConfig();
      // Use public API base for browser requests
      const response = await $fetch(`${config.public.apiBase}/api/auth/login`, {
        method: 'POST',
        body: { email, password },
      });
      
      this.setToken(response.accessToken);
      this.setUser(response.user);
      
      return response;
    },
    
    async fetchUser() {
      if (!this.token) return;
      
      try {
        const config = useRuntimeConfig();
        // Use public API base for browser requests
        const user = await $fetch(`${config.public.apiBase}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });
        this.setUser(user);
      } catch (error) {
        // Only logout if the error indicates an authentication problem.
        const status = error?.status || error?.statusCode || error?.response?.status;
        console.error('fetchUser failed', status, error);
        if (status === 401 || status === 403) {
          this.logout();
        } else {
          // For network errors or other issues, keep the token so the session
          // remains active client-side for retrying or offline work.
          this.setAuthError('Could not verify session due to network/server issue.');
        }
      }
    },
  },
});
