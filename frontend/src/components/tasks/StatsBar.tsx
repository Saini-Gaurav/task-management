'use client';
import { useEffect, useRef } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { CheckCircle2, Clock, Loader, LayoutGrid } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
  glowColor: string;
  delay: number;
}

function StatCard({ label, value, icon, gradient, glowColor, delay }: StatCardProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const target = value;
    let start = 0;
    const duration = 600;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      if (el) el.textContent = String(current);
      if (progress < 1) requestAnimationFrame(tick);
    };

    const timer = setTimeout(() => requestAnimationFrame(tick), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 flex flex-col gap-4 animate-fade-up"
      style={{
        background: 'var(--panel)',
        border: '1px solid var(--border)',
        animationDelay: `${delay}ms`,
        animationFillMode: 'both',
      }}
    >
      {/* Subtle glow in corner */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-30"
        style={{ background: glowColor }}
      />

      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
        style={{ background: gradient }}
      >
        {icon}
      </div>

      {/* Value + Label */}
      <div>
        <p className="text-3xl font-display font-bold text-heading leading-none">
          <span ref={ref}>0</span>
        </p>
        <p className="text-xs font-medium mt-1.5" style={{ color: 'var(--subtle)' }}>{label}</p>
      </div>
    </div>
  );
}

export default function StatsBar() {
  const { stats } = useTaskStore();

  const cards = [
    {
      label: 'Total Tasks',
      value: stats?.total ?? 0,
      icon: <LayoutGrid size={18} />,
      gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      glowColor: '#6366f1',
      delay: 0,
    },
    {
      label: 'Pending',
      value: stats?.pending ?? 0,
      icon: <Clock size={18} />,
      gradient: 'linear-gradient(135deg, #f59e0b, #f97316)',
      glowColor: '#f59e0b',
      delay: 80,
    },
    {
      label: 'In Progress',
      value: stats?.inProgress ?? 0,
      icon: <Loader size={18} />,
      gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
      glowColor: '#3b82f6',
      delay: 160,
    },
    {
      label: 'Completed',
      value: stats?.completed ?? 0,
      icon: <CheckCircle2 size={18} />,
      gradient: 'linear-gradient(135deg, #10b981, #34d399)',
      glowColor: '#10b981',
      delay: 240,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}
