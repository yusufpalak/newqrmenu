import { defineStore } from 'pinia';
import type {
  IAuthUser,
  IAuthResponse,
  ITenant,
} from '~/types';

interface AuthState {
  user: IAuthUser | null;
  token: string | null;
  currentTenant: ITenant | null;
  authError: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    currentTenant: null,
    authError: null,
  }),

  getters: {
    isAuthenticated: (state): boolean => !!state.token,
    isAdmin: (state): boolean =>
      state.user?.role === 'ADMIN' || state.user?.role === 'SUPERADMIN',
    isSuperAdmin: (state): boolean => state.user?.role === 'SUPERADMIN',
  },

  actions: {
    init(): void {
      if (process.client) {
        const token = localStorage.getItem('token');
        if (token) {
          this.token = token;
          const cachedUser = localStorage.getItem('user');
          if (cachedUser) {
            try {
              this.user = JSON.parse(cachedUser) as IAuthUser;
            } catch { /* ignore */ }
          }
          const tenant = localStorage.getItem('tenant');
          if (tenant) {
            try {
              this.currentTenant = JSON.parse(tenant) as ITenant;
            } catch { /* ignore */ }
          }
          void this.fetchUser();
        }
      }
    },

    setToken(token: string): void {
      this.token = token;
      if (process.client) localStorage.setItem('token', token);
    },

    setUser(user: IAuthUser | null): void {
      this.user = user;
      if (process.client) {
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        } else {
          localStorage.removeItem('user');
        }
      }
    },

    setTenant(tenant: ITenant): void {
      this.currentTenant = tenant;
      if (process.client) localStorage.setItem('tenant', JSON.stringify(tenant));
    },

    clearTenant(): void {
      this.currentTenant = null;
      if (process.client) localStorage.removeItem('tenant');
    },

    setAuthError(msg: string | null): void {
      this.authError = msg;
    },

    clearAuthError(): void {
      this.authError = null;
    },

    logout(): void {
      this.user = null;
      this.token = null;
      this.currentTenant = null;
      if (process.client) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('tenant');
      }
      void navigateTo('/admin/login');
    },

    async login(email: string, password: string): Promise<IAuthResponse> {
      const config = useRuntimeConfig();
      const response = await $fetch<IAuthResponse>(
        `${config.public.apiBase}/api/auth/login`,
        {
          method: 'POST',
          body: { email, password },
        },
      );
      this.setToken(response.accessToken);
      this.setUser(response.user);
      return response;
    },

    async fetchUser(): Promise<void> {
      if (!this.token) return;
      try {
        const config = useRuntimeConfig();
        const user = await $fetch<IAuthUser>(
          `${config.public.apiBase}/api/auth/me`,
          {
            headers: { Authorization: `Bearer ${this.token}` },
          },
        );
        this.setUser(user);
        if (user.tenant && !this.currentTenant) {
          this.setTenant(user.tenant);
        }
      } catch (error: unknown) {
        const err = error as {
          status?: number;
          statusCode?: number;
          response?: { status?: number };
        };
        const status = err?.status || err?.statusCode || err?.response?.status;
        if (status === 401 || status === 403) {
          this.logout();
        } else {
          this.setAuthError(
            'Could not verify session due to network/server issue.',
          );
        }
      }
    },
  },
});
