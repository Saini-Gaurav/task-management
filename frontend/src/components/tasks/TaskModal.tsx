'use client';
import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { X, Save, Plus, Loader2 } from 'lucide-react';
import { Task } from '@/types';
import { useTaskStore } from '@/store/taskStore';
import { ApiError } from '@/lib/api';

interface TaskModalProps {
  task: Task | null;
  onClose: () => void;
}

interface FormState {
  title: string;
  description: string;
  priority: string;
  status: string;
  dueDate: string;
}

const labelClass = 'block text-xs font-semibold uppercase tracking-wider mb-2';
const inputClass =
  'w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none';

export default function TaskModal({ task, onClose }: TaskModalProps) {
  const { createTask, updateTask, isSubmitting } = useTaskStore();
  const isEditing = !!task;
  const overlayRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<FormState>({
    title: task?.title ?? '',
    description: task?.description ?? '',
    priority: task?.priority ?? 'MEDIUM',
    status: task?.status ?? 'PENDING',
    dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
  });
  const [errors, setErrors] = useState<Partial<FormState>>({});

  // Escape key
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const set = (k: keyof FormState, v: string) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Partial<FormState> = {};
    if (!form.title.trim()) e.title = 'Title is required';
    else if (form.title.length > 200) e.title = 'Max 200 characters';
    if (form.description.length > 1000) e.description = 'Max 1000 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    const payload = {
      title: form.title.trim(),
      ...(form.description.trim() && { description: form.description.trim() }),
      priority: form.priority,
      ...(form.dueDate && { dueDate: form.dueDate }),
      ...(isEditing && { status: form.status }),
    };

    try {
      if (isEditing) {
        await updateTask(task.id, payload);
        toast.success('Task updated successfully');
      } else {
        await createTask(payload);
        toast.success('Task created!');
      }
      onClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Something went wrong');
    }
  };

  const fieldStyle = (hasError: boolean) => ({
    background: 'var(--surface)',
    border: `1px solid ${hasError ? 'rgba(244,63,94,0.6)' : 'var(--border)'}`,
    color: 'var(--heading)',
    boxShadow: hasError ? '0 0 0 3px rgba(244,63,94,0.15)' : 'none',
  });

  const focusField = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)';
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)';
  };
  const blurField = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, hasError: boolean) => {
    e.currentTarget.style.borderColor = hasError ? 'rgba(244,63,94,0.6)' : 'var(--border)';
    e.currentTarget.style.boxShadow = hasError ? '0 0 0 3px rgba(244,63,94,0.15)' : 'none';
  };

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in"
      style={{ background: 'rgba(9,11,17,0.85)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="w-full sm:max-w-lg sm:mx-4 rounded-t-2xl sm:rounded-2xl overflow-hidden animate-scale-in flex flex-col"
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--border-light)',
          boxShadow: '0 25px 80px rgba(0,0,0,0.8)',
          maxHeight: '92dvh',
        }}
      >
        {/* Drag handle — mobile only */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border-light)' }} />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div>
            <h2 className="font-display text-lg font-bold text-heading">
              {isEditing ? 'Edit task' : 'Create new task'}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
              {isEditing ? 'Update the details below' : 'Fill in the details to create a task'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl transition-all flex-shrink-0"
            style={{ color: 'var(--muted)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.color = 'var(--heading)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)'; }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable form body */}
        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-5 overflow-y-auto flex-1">
          {/* Title */}
          <div>
            <label className={labelClass} style={{ color: 'var(--subtle)' }}>
              Title <span style={{ color: '#fb7185' }}>*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              onFocus={focusField}
              onBlur={e => blurField(e, !!errors.title)}
              placeholder="What needs to be done?"
              autoFocus
              className={inputClass}
              style={fieldStyle(!!errors.title)}
            />
            {errors.title && <p className="mt-1.5 text-xs" style={{ color: '#fb7185' }}>{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className={labelClass} style={{ color: 'var(--subtle)' }}>Description</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              onFocus={focusField}
              onBlur={e => blurField(e, !!errors.description)}
              placeholder="Add more context… (optional)"
              rows={3}
              className={`${inputClass} resize-none`}
              style={fieldStyle(!!errors.description)}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.description && <p className="text-xs" style={{ color: '#fb7185' }}>{errors.description}</p>}
              <p className="text-xs ml-auto" style={{ color: form.description.length > 900 ? '#fb7185' : 'var(--muted)' }}>
                {form.description.length}/1000
              </p>
            </div>
          </div>

          {/* Priority + Status — always 2 cols */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} style={{ color: 'var(--subtle)' }}>Priority</label>
              <select
                value={form.priority}
                onChange={e => set('priority', e.target.value)}
                onFocus={focusField}
                onBlur={e => blurField(e, false)}
                className={`${inputClass} cursor-pointer w-full`}
                style={fieldStyle(false)}
              >
                <option value="LOW">🟢 Low</option>
                <option value="MEDIUM">🟡 Medium</option>
                <option value="HIGH">🔴 High</option>
              </select>
            </div>

            {isEditing ? (
              <div>
                <label className={labelClass} style={{ color: 'var(--subtle)' }}>Status</label>
                <select
                  value={form.status}
                  onChange={e => set('status', e.target.value)}
                  onFocus={focusField}
                  onBlur={e => blurField(e, false)}
                  className={`${inputClass} cursor-pointer w-full`}
                  style={fieldStyle(false)}
                >
                  <option value="PENDING">⏳ Pending</option>
                  <option value="IN_PROGRESS">⚡ In Progress</option>
                  <option value="COMPLETED">✅ Completed</option>
                </select>
              </div>
            ) : (
              /* Due date sits in grid col 2 when not editing */
              <div>
                <label className={labelClass} style={{ color: 'var(--subtle)' }}>Due date</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={e => set('dueDate', e.target.value)}
                  onFocus={focusField}
                  onBlur={e => blurField(e, false)}
                  min={new Date().toISOString().split('T')[0]}
                  className={`${inputClass} cursor-pointer w-full`}
                  style={{ ...fieldStyle(false), colorScheme: 'dark' }}
                />
              </div>
            )}
          </div>

          {/* Due Date — only shown on edit (already in grid when creating) */}
          {isEditing && (
            <div>
              <label className={labelClass} style={{ color: 'var(--subtle)' }}>
                Due date <span style={{ color: 'var(--muted)' }}>(optional)</span>
              </label>
              <input
                type="date"
                value={form.dueDate}
                onChange={e => set('dueDate', e.target.value)}
                onFocus={focusField}
                onBlur={e => blurField(e, false)}
                min={new Date().toISOString().split('T')[0]}
                className={`${inputClass} cursor-pointer w-full`}
                style={{ ...fieldStyle(false), colorScheme: 'dark' }}
              />
            </div>
          )}

          {/* Actions — sticky at bottom */}
          <div className="flex gap-3 pt-1 pb-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--body)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'var(--heading)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--body)'; }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed btn-primary"
            >
              {isSubmitting
                ? <Loader2 size={15} className="animate-spin" />
                : isEditing
                ? <><Save size={15} /> Save changes</>
                : <><Plus size={15} /> Create task</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
