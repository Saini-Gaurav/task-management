'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    router.replace(token ? '/dashboard' : '/auth/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-void flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  );
}
