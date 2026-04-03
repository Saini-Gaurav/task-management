'use client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { LogOut, Bell } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useTaskStore } from '@/store/taskStore';
import { User } from '@/types';

interface NavbarProps { user: User | null; }

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { stats } = useTaskStore();

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out');
    router.push('/auth/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? 'U';

  return (
    <header className="sticky top-0 z-40 border-b w-full overflow-x-hidden"
      style={{
        background: 'rgba(15, 17, 23, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderColor: 'var(--border)',
      }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" opacity="0.9"/>
              <rect x="10" y="2" width="6" height="6" rx="1.5" fill="white" opacity="0.5"/>
              <rect x="2" y="10" width="6" height="6" rx="1.5" fill="white" opacity="0.5"/>
              <rect x="10" y="10" width="6" height="6" rx="1.5" fill="white" opacity="0.9"/>
            </svg>
          </div>
          <span className="font-display font-semibold text-heading text-base">TaskFlow</span>
          {stats && (
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium"
              style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
              {stats.total} tasks
            </div>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Pending badge */}
          {stats && stats.pending > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg"
              style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }}>
              <Bell size={11} />
              {stats.pending} pending
            </div>
          )}

          {/* Divider */}
          <div className="w-px h-5 mx-1" style={{ background: 'var(--border)' }} />

          {/* User */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              {initials}
            </div>
            <span className="text-sm font-medium" style={{ color: '#9ba3b8' }}>{user?.name}</span>
          </div>

          {/* Logout */}
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
            style={{ color: '#4a5068', border: '1px solid transparent' }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#fb7185';
              e.currentTarget.style.background = 'rgba(244,63,94,0.08)';
              e.currentTarget.style.borderColor = 'rgba(244,63,94,0.2)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#4a5068';
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'transparent';
            }}>
            <LogOut size={13} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
