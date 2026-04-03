import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        void: '#090b11',
        surface: '#0f1117',
        panel: '#151821',
        border: '#1e2230',
        'border-light': '#252840',
        muted: '#4a5068',
        subtle: '#6b7280',
        body: '#9ba3b8',
        heading: '#e8eaf0',
        indigo: {
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
        },
        violet: {
          400: '#a78bfa',
          500: '#8b5cf6',
        },
        emerald: {
          400: '#34d399',
          500: '#10b981',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
        },
        rose: {
          400: '#fb7185',
          500: '#f43f5e',
        },
      },
      fontFamily: {
        display: ['var(--font-syne)', 'sans-serif'],
        body: ['var(--font-outfit)', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glow-indigo': 'radial-gradient(ellipse at center, rgba(99,102,241,0.15) 0%, transparent 70%)',
        'glow-violet': 'radial-gradient(ellipse at center, rgba(139,92,246,0.12) 0%, transparent 70%)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-right': 'slideRight 0.4s ease forwards',
        'scale-in': 'scaleIn 0.3s ease forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.8s infinite',
        'float': 'float 3s ease-in-out infinite',
        'count-up': 'countUp 0.6s ease forwards',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideRight: {
          from: { opacity: '0', transform: 'translateX(-16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-500% 0' },
          '100%': { backgroundPosition: '500% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        countUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'glow-sm': '0 0 20px rgba(99,102,241,0.2)',
        'glow-md': '0 0 40px rgba(99,102,241,0.25)',
        'glow-lg': '0 0 60px rgba(99,102,241,0.3)',
        'card': '0 1px 3px rgba(0,0,0,0.4), 0 1px 1px rgba(0,0,0,0.3)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.2)',
        'modal': '0 25px 80px rgba(0,0,0,0.8)',
      },
    },
  },
  plugins: [],
};
export default config;
