import { create } from 'zustand';
import { Task, TaskFilters, TaskStats } from '@/types';
import { tasksApi } from '@/lib/api';

interface Pagination { page: number; limit: number; total: number; totalPages: number; }

interface TaskState {
  tasks: Task[];
  stats: TaskStats | null;
  filters: TaskFilters;
  pagination: Pagination;
  isLoading: boolean;
  isSubmitting: boolean;
  fetchTasks: () => Promise<void>;
  fetchStats: () => Promise<void>;
  createTask: (data: object) => Promise<void>;
  updateTask: (id: string, data: object) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  setFilters: (f: Partial<TaskFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: TaskFilters = {
  status: '', priority: '', search: '', page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc',
};

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  stats: null,
  filters: defaultFilters,
  pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
  isLoading: false,
  isSubmitting: false,

  fetchTasks: async () => {
    set({ isLoading: true });
    try {
      const { filters } = get();
      const params: Record<string, string> = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.search) params.search = filters.search;
      if (filters.page) params.page = String(filters.page);
      if (filters.limit) params.limit = String(filters.limit);
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.sortOrder) params.sortOrder = filters.sortOrder;
      const res = await tasksApi.getAll(params);
      set({ tasks: res.data ?? [], pagination: res.meta ?? { page: 1, limit: 10, total: 0, totalPages: 0 } });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchStats: async () => {
    try {
      const res = await tasksApi.getStats();
      set({ stats: res.data ?? null });
    } catch { /* non-critical */ }
  },

  createTask: async (data) => {
    set({ isSubmitting: true });
    try {
      await tasksApi.create(data);
      await Promise.all([get().fetchTasks(), get().fetchStats()]);
    } finally { set({ isSubmitting: false }); }
  },

  updateTask: async (id, data) => {
    set({ isSubmitting: true });
    try {
      const res = await tasksApi.update(id, data);
      set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? res.data! : t)) }));
      await get().fetchStats();
    } finally { set({ isSubmitting: false }); }
  },

  deleteTask: async (id) => {
    set({ isSubmitting: true });
    try {
      await tasksApi.delete(id);
      set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
      await get().fetchStats();
    } finally { set({ isSubmitting: false }); }
  },

  toggleTask: async (id) => {
    try {
      const res = await tasksApi.toggle(id);
      set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? res.data! : t)) }));
      await get().fetchStats();
    } catch { /* handled by caller */ }
  },

  setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f, page: 1 } })),
  resetFilters: () => set({ filters: defaultFilters }),
}));
