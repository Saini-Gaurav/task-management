'use client';
import { useRef } from 'react';
import { Search, X, SlidersHorizontal, ArrowDownUp } from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';

const selectClass =
  'px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/40';

export default function TaskFilters() {
  const { filters, setFilters, fetchTasks, resetFilters } = useTaskStore();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSearch = (value: string) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters({ search: value });
      fetchTasks();
    }, 380);
  };

  const handleSelect = (key: string, value: string) => {
    setFilters({ [key]: value } as Parameters<typeof setFilters>[0]);
    setTimeout(() => fetchTasks(), 0);
  };

  const activeCount = [filters.status, filters.priority, filters.search].filter(Boolean).length;

  return (
    <div
      className="rounded-2xl p-4 space-y-3 animate-fade-up"
      style={{ background: 'var(--panel)', border: '1px solid var(--border)', animationDelay: '100ms', animationFillMode: 'both' }}
    >
      {/* Search — always full width */}
      <div className="relative w-full">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
        <input
          type="text"
          placeholder="Search tasks…"
          defaultValue={filters.search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm transition-all focus:outline-none"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--heading)',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
          onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
        />
      </div>

      {/* Dropdowns — 2 cols on mobile, single row on sm+ */}
      <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2">
        {/* Status */}
        <select
          value={filters.status}
          onChange={(e) => handleSelect('status', e.target.value)}
          className={`${selectClass} w-full`}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: filters.status ? 'var(--heading)' : 'var(--muted)' }}
        >
          <option value="">All Status</option>
          <option value="PENDING">⏳ Pending</option>
          <option value="IN_PROGRESS">⚡ In Progress</option>
          <option value="COMPLETED">✅ Completed</option>
        </select>

        {/* Priority */}
        <select
          value={filters.priority}
          onChange={(e) => handleSelect('priority', e.target.value)}
          className={`${selectClass} w-full`}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: filters.priority ? 'var(--heading)' : 'var(--muted)' }}
        >
          <option value="">All Priority</option>
          <option value="HIGH">🔴 High</option>
          <option value="MEDIUM">🟡 Medium</option>
          <option value="LOW">🟢 Low</option>
        </select>

        {/* Sort — spans full width on mobile */}
        <select
          value={filters.sortOrder}
          onChange={(e) => handleSelect('sortOrder', e.target.value)}
          className={`${selectClass} w-full col-span-2 sm:col-span-1`}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--body)' }}
        >
          <option value="desc">↓ Newest first</option>
          <option value="asc">↑ Oldest first</option>
        </select>
      </div>

      {/* Active filter pills */}
      {activeCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted)' }}>
            <SlidersHorizontal size={12} />
            <span>Filters:</span>
          </div>

          {filters.status && (
            <FilterPill
              label={filters.status.replace('_', ' ')}
              color="rgba(99,102,241,0.15)"
              textColor="#818cf8"
              borderColor="rgba(99,102,241,0.3)"
              onRemove={() => handleSelect('status', '')}
            />
          )}
          {filters.priority && (
            <FilterPill
              label={filters.priority}
              color="rgba(251,191,36,0.1)"
              textColor="#fbbf24"
              borderColor="rgba(251,191,36,0.3)"
              onRemove={() => handleSelect('priority', '')}
            />
          )}
          {filters.search && (
            <FilterPill
              label={`"${filters.search}"`}
              color="rgba(139,92,246,0.1)"
              textColor="#a78bfa"
              borderColor="rgba(139,92,246,0.3)"
              onRemove={() => { setFilters({ search: '' }); setTimeout(() => fetchTasks(), 0); }}
            />
          )}

          <button
            onClick={() => { resetFilters(); fetchTasks(); }}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-all"
            style={{ color: '#fb7185' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <ArrowDownUp size={10} />
            Reset all
          </button>
        </div>
      )}
    </div>
  );
}

interface PillProps {
  label: string;
  color: string;
  textColor: string;
  borderColor: string;
  onRemove: () => void;
}

function FilterPill({ label, color, textColor, borderColor, onRemove }: PillProps) {
  return (
    <span
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium capitalize"
      style={{ background: color, color: textColor, border: `1px solid ${borderColor}` }}
    >
      {label}
      <button onClick={onRemove} className="transition-opacity hover:opacity-60">
        <X size={10} />
      </button>
    </span>
  );
}
