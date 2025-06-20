"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// View Transition API helper
function startViewTransition(callback: () => void) {
  // @ts-ignore
  if (typeof document !== 'undefined' && document.startViewTransition) {
    // @ts-ignore
    document.startViewTransition(callback);
  } else {
    callback();
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      startViewTransition(() => router.push('/tasks'));
    } else {
      const data = await res.json();
      setError(data.error || 'Login gagal');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 px-4">
      <div className="w-full max-w-md p-8 bg-white/90 rounded-2xl shadow-xl border border-blue-100">
        <h1 className="text-3xl font-extrabold text-center text-blue-700 mb-6 tracking-tight">Masuk ke Taskwise</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 px-4 py-2 rounded-lg outline-none transition"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 px-4 py-2 rounded-lg outline-none transition"
              required
            />
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-2 rounded-lg shadow transition">Login</button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-600">
          Belum punya akun?{' '}
          <a href="/register" className="text-blue-600 hover:underline font-medium">Daftar</a>
        </div>
      </div>
    </div>
  );
}
