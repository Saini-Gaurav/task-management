'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowRight, Loader2, Check } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { ApiError } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const pwChecks = [
    { label: '8+ characters', ok: form.password.length >= 8 },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(form.password) },
    { label: 'Lowercase letter', ok: /[a-z]/.test(form.password) },
    { label: 'Number', ok: /\d/.test(form.password) },
  ];

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!pwChecks.every(c => c.ok)) e.password = 'Password does not meet requirements';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    try {
      await register(form.name.trim(), form.email, form.password);
      toast.success('Account created! Welcome aboard.');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Registration failed');
    }
  };

  const inputClass = (key: string) =>
    `field w-full px-4 py-3 rounded-xl text-sm ${errors[key] ? 'border-rose-500/60 shadow-[0_0_0_3px_rgba(244,63,94,0.15)]' : ''}`;

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-display text-3xl font-bold text-heading mb-2">Create account</h1>
        <p className="text-sm" style={{ color: '#6b7280' }}>
          Already have one?{' '}
          <Link href="/auth/login" className="font-medium" style={{ color: '#818cf8' }}>
            Sign in
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium" style={{ color: '#9ba3b8' }}>Full name</label>
          <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Jane Smith" className={inputClass('name')} />
          {errors.name && <p className="text-xs" style={{ color: '#fb7185' }}>{errors.name}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium" style={{ color: '#9ba3b8' }}>Email address</label>
          <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
            placeholder="you@company.com" className={inputClass('email')} />
          {errors.email && <p className="text-xs" style={{ color: '#fb7185' }}>{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium" style={{ color: '#9ba3b8' }}>Password</label>
          <div className="relative">
            <input type={showPw ? 'text' : 'password'} value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••" className={`${inputClass('password')} pr-11`} />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: '#4a5068' }}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {/* Password strength */}
          {form.password && (
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {pwChecks.map(c => (
                <div key={c.label} className="flex items-center gap-1.5 text-xs">
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${c.ok ? 'bg-emerald-500' : 'bg-border'}`}>
                    {c.ok && <Check size={8} className="text-white" strokeWidth={3} />}
                  </div>
                  <span style={{ color: c.ok ? '#34d399' : '#4a5068' }}>{c.label}</span>
                </div>
              ))}
            </div>
          )}
          {errors.password && <p className="text-xs" style={{ color: '#fb7185' }}>{errors.password}</p>}
        </div>

        {/* Confirm */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium" style={{ color: '#9ba3b8' }}>Confirm password</label>
          <input type="password" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })}
            placeholder="••••••••" className={inputClass('confirm')} />
          {errors.confirm && <p className="text-xs" style={{ color: '#fb7185' }}>{errors.confirm}</p>}
        </div>

        <button type="submit" disabled={isLoading}
          className="btn-primary relative w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed mt-1">
          {isLoading
            ? <Loader2 size={16} className="animate-spin" />
            : <><span>Create account</span><ArrowRight size={16} /></>}
        </button>
      </form>
    </div>
  );
}
