export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-void">
      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col justify-between p-14"
        style={{ background: 'linear-gradient(135deg, #0a0c14 0%, #0f1117 50%, #0d0f18 100%)' }}>

        {/* Animated grid */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(99,102,241,0.07) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(99,102,241,0.07) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />

        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/3 w-80 h-80 rounded-full animate-pulse-glow"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-60 h-60 rounded-full animate-pulse-glow"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', animationDelay: '1s' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" opacity="0.9"/>
              <rect x="10" y="2" width="6" height="6" rx="1.5" fill="white" opacity="0.5"/>
              <rect x="2" y="10" width="6" height="6" rx="1.5" fill="white" opacity="0.5"/>
              <rect x="10" y="10" width="6" height="6" rx="1.5" fill="white" opacity="0.9"/>
            </svg>
          </div>
          <span className="font-display text-xl font-semibold tracking-tight text-heading">TaskFlow</span>
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Production-ready task management
          </div>
          <h1 className="font-display text-5xl xl:text-6xl font-bold leading-[1.1] text-heading">
            Command<br />
            <span style={{ background: 'linear-gradient(135deg, #818cf8, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              your work.
            </span>
          </h1>
          <p className="text-base leading-relaxed max-w-sm" style={{ color: '#6b7280' }}>
            A precision-engineered task system with JWT authentication, real-time filtering, and full CRUD — built for modern teams.
          </p>

          {/* Feature list */}
          <div className="space-y-3 pt-2">
            {[
              { icon: '⚡', text: 'JWT access + refresh token rotation' },
              { icon: '🔍', text: 'Real-time search & multi-filter' },
              { icon: '📊', text: 'Live task analytics dashboard' },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3">
                <span className="text-base">{f.icon}</span>
                <span className="text-sm" style={{ color: '#9ba3b8' }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom demo hint */}
        <div className="relative z-10 p-4 rounded-xl"
          style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <p className="text-xs font-medium" style={{ color: '#818cf8' }}>Demo credentials</p>
          <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
            demo@taskflow.dev · Demo@1234
          </p>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="w-full lg:w-[48%] flex items-center justify-center p-6 sm:p-10"
        style={{ background: 'var(--surface)' }}>
        <div className="w-full max-w-md animate-fade-up">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                <rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" opacity="0.9"/>
                <rect x="10" y="2" width="6" height="6" rx="1.5" fill="white" opacity="0.5"/>
                <rect x="2" y="10" width="6" height="6" rx="1.5" fill="white" opacity="0.5"/>
                <rect x="10" y="10" width="6" height="6" rx="1.5" fill="white" opacity="0.9"/>
              </svg>
            </div>
            <span className="font-display text-lg font-semibold text-heading">TaskFlow</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
