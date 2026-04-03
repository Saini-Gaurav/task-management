'use client';
import { useTaskStore } from '@/store/taskStore';
import TaskCard from './TaskCard';
import { Task } from '@/types';
import { ClipboardX, ChevronLeft, ChevronRight } from 'lucide-react';

interface TaskListProps {
  onEdit: (task: Task) => void;
}

export default function TaskList({ onEdit }: TaskListProps) {
  const { tasks, isLoading, pagination, filters, setFilters, fetchTasks } = useTaskStore();

  const handlePage = (newPage: number) => {
    setFilters({ page: newPage });
    setTimeout(() => fetchTasks(), 0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="skeleton h-[88px] rounded-2xl"
            style={{ animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>
    );
  }

  if (!tasks.length) {
    return (
      <div
        className="flex flex-col items-center justify-center py-24 rounded-2xl text-center animate-fade-up"
        style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <ClipboardX size={28} style={{ color: 'var(--muted)' }} />
        </div>
        <h3 className="font-display text-lg font-semibold text-heading mb-1">No tasks found</h3>
        <p className="text-sm" style={{ color: 'var(--subtle)' }}>
          {filters.search || filters.status || filters.priority
            ? 'Try clearing your filters to see all tasks'
            : 'Hit "New Task" to create your first task'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Count */}
      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: 'var(--muted)' }}>
          Showing <span style={{ color: 'var(--body)' }}>{tasks.length}</span> of{' '}
          <span style={{ color: 'var(--body)' }}>{pagination.total}</span> tasks
        </p>
        {pagination.totalPages > 1 && (
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            Page {pagination.page} of {pagination.totalPages}
          </p>
        )}
      </div>

      {/* Task cards */}
      <div className="space-y-2.5">
        {tasks.map((task, i) => (
          <TaskCard key={task.id} task={task} onEdit={onEdit} index={i} />
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2 animate-fade-up">
          <button
            onClick={() => handlePage(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="p-2 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: 'var(--panel)', border: '1px solid var(--border)', color: 'var(--body)' }}
            onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <ChevronLeft size={16} />
          </button>

          {[...Array(pagination.totalPages)].map((_, i) => {
            const page = i + 1;
            const isActive = pagination.page === page;
            return (
              <button
                key={page}
                onClick={() => handlePage(page)}
                className="w-9 h-9 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: isActive ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'var(--panel)',
                  color: isActive ? 'white' : 'var(--body)',
                  border: isActive ? 'none' : '1px solid var(--border)',
                  boxShadow: isActive ? '0 4px 16px rgba(99,102,241,0.4)' : 'none',
                }}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => handlePage(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="p-2 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: 'var(--panel)', border: '1px solid var(--border)', color: 'var(--body)' }}
            onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
