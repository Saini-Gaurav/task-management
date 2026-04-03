'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { ApiError } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Login failed');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-heading mb-2">Sign in</h1>
        <p className="text-sm" style={{ color: '#6b7280' }}>
          New here?{' '}
          <Link href="/auth/register"
            className="font-medium transition-colors"
            style={{ color: '#818cf8' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#a78bfa')}
            onMouseLeave={e => (e.currentTarget.style.color = '#818cf8')}>
            Create an account
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Email */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium" style={{ color: '#9ba3b8' }}>
            Email address
          </label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            placeholder="you@company.com"
            className={`field w-full px-4 py-3 rounded-xl text-sm ${errors.email ? 'border-rose-500/60 shadow-[0_0_0_3px_rgba(244,63,94,0.15)]' : ''}`}
          />
          {errors.email && <p className="text-xs" style={{ color: '#fb7185' }}>{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium" style={{ color: '#9ba3b8' }}>
            Password
          </label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className={`field w-full px-4 py-3 pr-11 rounded-xl text-sm ${errors.password ? 'border-rose-500/60 shadow-[0_0_0_3px_rgba(244,63,94,0.15)]' : ''}`}
            />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: '#4a5068' }}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-xs" style={{ color: '#fb7185' }}>{errors.password}</p>}
        </div>

        {/* Submit */}
        <button type="submit" disabled={isLoading}
          className="btn-primary relative w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed mt-2">
          {isLoading
            ? <Loader2 size={16} className="animate-spin" />
            : <><span>Continue</span><ArrowRight size={16} /></>}
        </button>
      </form>

      {/* Demo hint */}
      <div className="mt-6 p-3.5 rounded-xl text-xs"
        style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#6b7280' }}>
        <span style={{ color: '#818cf8' }} className="font-medium">Demo: </span>
        demo@taskflow.dev · Demo@1234
      </div>
    </div>
  );
}
