import { ApiResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

const processQueue = (token: string) => {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
};

async function attemptTokenRefresh(): Promise<string | null> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/auth/login';
      return null;
    }
    const data: ApiResponse<{ accessToken: string; refreshToken: string }> = await res.json();
    localStorage.setItem('accessToken', data.data!.accessToken);
    localStorage.setItem('refreshToken', data.data!.refreshToken);
    return data.data!.accessToken;
  } catch {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/auth/login';
    return null;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const accessToken = localStorage.getItem('accessToken');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  let response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

  if (response.status === 401) {
    const errorData = await response.json().catch(() => ({})) as ApiResponse;
    if (errorData.error === 'TOKEN_EXPIRED') {
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push(async (token) => {
            headers['Authorization'] = `Bearer ${token}`;
            const r = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
            resolve(r.json());
          });
        });
      }
      isRefreshing = true;
      const newToken = await attemptTokenRefresh();
      isRefreshing = false;
      if (newToken) {
        processQueue(newToken);
        headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
      } else {
        throw new ApiError(401, 'Session expired. Please log in again.');
      }
    } else {
      throw new ApiError(401, errorData.message || 'Unauthorized');
    }
  }

  const data: ApiResponse<T> = await response.json();
  if (!response.ok) throw new ApiError(response.status, data.message || 'Request failed');
  return data;
}

export const authApi = {
  register: (d: { name: string; email: string; password: string }) =>
    apiRequest<{ user: import('@/types').User; accessToken: string; refreshToken: string }>(
      '/auth/register', { method: 'POST', body: JSON.stringify(d) }
    ),
  login: (d: { email: string; password: string }) =>
    apiRequest<{ user: import('@/types').User; accessToken: string; refreshToken: string }>(
      '/auth/login', { method: 'POST', body: JSON.stringify(d) }
    ),
  logout: (refreshToken: string) =>
    apiRequest<null>('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) }),
  getMe: () => apiRequest<import('@/types').User>('/auth/me'),
};

export const tasksApi = {
  getAll: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiRequest<import('@/types').Task[]>(`/tasks${q}`);
  },
  create: (d: object) => apiRequest<import('@/types').Task>('/tasks', { method: 'POST', body: JSON.stringify(d) }),
  update: (id: string, d: object) =>
    apiRequest<import('@/types').Task>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(d) }),
  delete: (id: string) => apiRequest<null>(`/tasks/${id}`, { method: 'DELETE' }),
  toggle: (id: string) => apiRequest<import('@/types').Task>(`/tasks/${id}/toggle`, { method: 'PATCH' }),
  getStats: () => apiRequest<import('@/types').TaskStats>('/tasks/stats'),
};
