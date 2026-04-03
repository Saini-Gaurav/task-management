import { create } from 'zustand';
import { User } from '@/types';
import { authApi, ApiError } from '@/lib/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await authApi.login({ email, password });
      localStorage.setItem('accessToken', res.data!.accessToken);
      localStorage.setItem('refreshToken', res.data!.refreshToken);
      set({ user: res.data!.user, isAuthenticated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true });
    try {
      const res = await authApi.register({ name, email, password });
      localStorage.setItem('accessToken', res.data!.accessToken);
      localStorage.setItem('refreshToken', res.data!.refreshToken);
      set({ user: res.data!.user, isAuthenticated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try { if (refreshToken) await authApi.logout(refreshToken); } catch { /* ignore */ }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, isAuthenticated: false });
  },

  fetchMe: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      const res = await authApi.getMe();
      set({ user: res.data!, isAuthenticated: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, isAuthenticated: false });
      }
    }
  },
}));
