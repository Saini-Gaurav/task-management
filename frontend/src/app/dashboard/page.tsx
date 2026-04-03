'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Zap } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useTaskStore } from '@/store/taskStore';
import Navbar from '@/components/layout/Navbar';
import StatsBar from '@/components/tasks/StatsBar';
import TaskFilters from '@/components/tasks/TaskFilters';
import TaskList from '@/components/tasks/TaskList';
import TaskModal from '@/components/tasks/TaskModal';
import { Task } from '@/types';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return 'Working late';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
}

function getMotivation(stats: { pending?: number; completed?: number; total?: number } | null) {
  if (!stats) return 'Loading your workspace…';
  if (stats.total === 0) return "Your workspace is clear — let's build something.";
  if (stats.completed === stats.total) return 'All tasks completed. Exceptional work. 🎯';
  if ((stats.pending ?? 0) > 5) return `${stats.pending} tasks waiting — let's get moving.`;
  return `${stats.completed} of ${stats.total} tasks done. Keep the momentum.`;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, fetchMe, isAuthenticated } = useAuthStore();
  const { fetchTasks, fetchStats, stats } = useTaskStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.replace('/auth/login'); return; }
    fetchMe().then(() => setHydrated(true));
  }, [fetchMe, router]);

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      fetchTasks();
      fetchStats();
    }
  }, [hydrated, isAuthenticated, fetchTasks, fetchStats]);

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingTask(null);
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--void)' }}>
        <div className="flex flex-col items-center gap-5 animate-fade-in">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            <svg width="22" height="22" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" opacity="0.9"/>
              <rect x="10" y="2" width="6" height="6" rx="1.5" fill="white" opacity="0.5"/>
              <rect x="2" y="10" width="6" height="6" rx="1.5" fill="white" opacity="0.5"/>
              <rect x="10" y="10" width="6" height="6" rx="1.5" fill="white" opacity="0.9"/>
            </svg>
          </div>
          <div className="space-y-1 text-center">
            <p className="font-display font-semibold text-heading text-sm">TaskFlow</p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Loading your workspace…</p>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: '#6366f1', animationDelay: `${i * 200}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const firstName = user?.name?.split(' ')[0] ?? 'there';
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <div className="min-h-screen w-full overflow-x-hidden" style={{ background: 'var(--void)' }}>
      <Navbar user={user} />

      {/* Ambient glow at top */}
      <div
        className="absolute top-14 left-1/2 -translate-x-1/2 w-full max-w-lg h-40 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 70%)' }}
      />

      <main className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-4 sm:space-y-6">

        {/* ── Hero Header ── */}
        <div
          className="rounded-2xl p-5 sm:p-8 flex flex-col gap-4 animate-fade-up"
          style={{
            background: 'linear-gradient(135deg, var(--panel) 0%, rgba(21,24,33,0.8) 100%)',
            border: '1px solid var(--border)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Corner decoration */}
          <div
            className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 pointer-events-none"
            style={{ background: 'radial-gradient(circle at top right, rgba(99,102,241,0.1) 0%, transparent 60%)' }}
          />

          <div className="relative z-10 space-y-2">
            {/* Greeting badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
              style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}
            >
              <Zap size={10} fill="currentColor" />
              <span className="truncate max-w-[200px] sm:max-w-none">{today}</span>
            </div>

            <h1 className="font-display text-2xl sm:text-4xl font-bold text-heading leading-tight">
              {getGreeting()},{' '}
              <span style={{ background: 'linear-gradient(135deg, #818cf8, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {firstName}
              </span>
            </h1>

            <p className="text-sm" style={{ color: 'var(--subtle)' }}>
              {getMotivation(stats)}
            </p>
          </div>

          {/* New Task button — full width on mobile */}
          <button
            onClick={() => setModalOpen(true)}
            className="btn-primary relative flex items-center justify-center gap-2.5 w-full sm:w-auto sm:self-start px-5 py-3 rounded-xl text-sm font-semibold text-white"
            style={{ boxShadow: '0 4px 20px rgba(99,102,241,0.4)' }}
          >
            <Plus size={16} strokeWidth={2.5} />
            New Task
          </button>
        </div>

        {/* ── Stats ── */}
        <StatsBar />

        {/* ── Filters ── */}
        <TaskFilters />

        {/* ── Task List ── */}
        <TaskList onEdit={handleEdit} />

      </main>

      {/* Modal */}
      {modalOpen && (
        <TaskModal task={editingTask} onClose={handleCloseModal} />
      )}
    </div>
  );
}
