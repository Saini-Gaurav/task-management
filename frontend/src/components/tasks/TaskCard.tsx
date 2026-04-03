'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Pencil, Trash2, RefreshCw, Calendar, Flag } from 'lucide-react';
import { format, isPast, isToday, differenceInDays } from 'date-fns';
import { Task } from '@/types';
import { useTaskStore } from '@/store/taskStore';
import { ApiError } from '@/lib/api';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  index: number;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; dot: string }> = {
  PENDING: {
    label: 'Pending',
    bg: 'rgba(251,191,36,0.1)',
    text: '#fbbf24',
    border: 'rgba(251,191,36,0.25)',
    dot: '#fbbf24',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    bg: 'rgba(59,130,246,0.1)',
    text: '#60a5fa',
    border: 'rgba(59,130,246,0.25)',
    dot: '#3b82f6',
  },
  COMPLETED: {
    label: 'Completed',
    bg: 'rgba(16,185,129,0.1)',
    text: '#34d399',
    border: 'rgba(16,185,129,0.25)',
    dot: '#10b981',
  },
};

const PRIORITY_CONFIG: Record<string, { color: string; label: string }> = {
  HIGH:   { color: '#fb7185', label: 'High' },
  MEDIUM: { color: '#fbbf24', label: 'Medium' },
  LOW:    { color: '#34d399', label: 'Low' },
};

export default function TaskCard({ task, onEdit, index }: TaskCardProps) {
  const { toggleTask, deleteTask } = useTaskStore();
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const status = STATUS_CONFIG[task.status];
  const priority = PRIORITY_CONFIG[task.priority];
  const isCompleted = task.status === 'COMPLETED';

  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && isPast(dueDate) && !isCompleted && !isToday(dueDate);
  const isDueToday = dueDate && isToday(dueDate);
  const daysUntilDue = dueDate ? differenceInDays(dueDate, new Date()) : null;

  const handleToggle = async () => {
    setToggling(true);
    try {
      await toggleTask(task.id);
      toast.success('Status updated');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to update');
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${task.title}"?`)) return;
    setDeleting(true);
    try {
      await deleteTask(task.id);
      toast.success('Task deleted');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="task-card group rounded-2xl px-5 py-4 flex gap-4 items-start animate-fade-up"
      style={{
        background: 'var(--panel)',
        border: '1px solid var(--border)',
        opacity: isCompleted ? 0.6 : 1,
        animationDelay: `${index * 50}ms`,
        animationFillMode: 'both',
      }}
    >
      {/* Priority stripe */}
      <div
        className="flex-shrink-0 mt-1 w-1 self-stretch rounded-full"
        style={{ background: priority.color, opacity: isCompleted ? 0.4 : 1 }}
      />

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Title row */}
        <div className="flex items-start gap-3 flex-wrap">
          <p
            className="flex-1 text-sm font-medium leading-snug"
            style={{
              color: isCompleted ? 'var(--muted)' : 'var(--heading)',
              textDecoration: isCompleted ? 'line-through' : 'none',
            }}
          >
            {task.title}
          </p>

          {/* Status badge */}
          <span
            className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg"
            style={{ background: status.bg, color: status.text, border: `1px solid ${status.border}` }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.dot }} />
            {status.label}
          </span>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--muted)' }}>
            {task.description}
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Priority */}
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--subtle)' }}>
            <Flag size={11} style={{ color: priority.color }} />
            <span>{priority.label}</span>
          </div>

          {/* Due date */}
          {dueDate && (
            <div
              className="flex items-center gap-1.5 text-xs"
              style={{
                color: isOverdue ? '#fb7185' : isDueToday ? '#fbbf24' : 'var(--subtle)',
              }}
            >
              <Calendar size={11} />
              <span>
                {isOverdue
                  ? `Overdue · ${format(dueDate, 'MMM d')}`
                  : isDueToday
                  ? 'Due today'
                  : daysUntilDue !== null && daysUntilDue <= 3
                  ? `Due in ${daysUntilDue}d`
                  : format(dueDate, 'MMM d, yyyy')}
              </span>
            </div>
          )}

          {/* Created */}
          <div className="text-xs" style={{ color: 'var(--muted)' }}>
            {format(new Date(task.createdAt), 'MMM d')}
          </div>
        </div>
      </div>

      {/* Actions — visible on hover */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
        {/* Toggle */}
        <ActionBtn
          onClick={handleToggle}
          disabled={toggling}
          title="Cycle status"
          hoverColor="rgba(99,102,241,0.15)"
          hoverText="#818cf8"
        >
          <RefreshCw size={14} className={toggling ? 'animate-spin' : ''} />
        </ActionBtn>

        {/* Edit */}
        <ActionBtn
          onClick={() => onEdit(task)}
          title="Edit task"
          hoverColor="rgba(139,92,246,0.15)"
          hoverText="#a78bfa"
        >
          <Pencil size={14} />
        </ActionBtn>

        {/* Delete */}
        <ActionBtn
          onClick={handleDelete}
          disabled={deleting}
          title="Delete task"
          hoverColor="rgba(244,63,94,0.12)"
          hoverText="#fb7185"
        >
          <Trash2 size={14} />
        </ActionBtn>
      </div>
    </div>
  );
}

interface ActionBtnProps {
  onClick: () => void;
  disabled?: boolean;
  title: string;
  hoverColor: string;
  hoverText: string;
  children: React.ReactNode;
}

function ActionBtn({ onClick, disabled, title, hoverColor, hoverText, children }: ActionBtnProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="p-2 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      style={{ color: 'var(--muted)' }}
      onMouseEnter={e => {
        e.currentTarget.style.background = hoverColor;
        e.currentTarget.style.color = hoverText;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = 'var(--muted)';
      }}
    >
      {children}
    </button>
  );
}
