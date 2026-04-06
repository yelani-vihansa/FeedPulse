'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function Login() {
  const router = useRouter();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${apiBaseUrl}/api/auth/login`, {
        email,
        password
      });

      const token = response.data?.data?.token;
      if (response.data?.success && token) {
        localStorage.setItem('token', token);
        sessionStorage.setItem('feedpulse_login_success', '1');
        router.replace('/dashboard');
        window.location.assign(`${window.location.origin}/dashboard`);
        return;
      }

      setError('Login succeeded but no session token was returned.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials. Use the demo login below.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="feedpulse-surface w-full max-w-md rounded-[28px] p-8 md:p-10">
        <div className="text-center mb-8">
          <span className="inline-flex items-center rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#2563EB] ring-1 ring-[#DBEAFE] mb-4">
            Demo Project
          </span>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Login</h1>
          <p className="text-gray-600">Access the feedback dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="feedpulse-input"
              placeholder="admin@feedpulse.com"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="feedpulse-input"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="feedpulse-button-primary w-full"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          {loading && (
            <div className="rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3 text-sm text-[#2563EB]">
              Signing you in...
            </div>
          )}
        </form>

        <div className="mt-6 rounded-2xl border border-[#DBEAFE] bg-[#F8FBFF] p-4">
          <p className="text-sm text-gray-600 text-center">
            Demo credentials for this project:<br />
            <span className="font-mono text-xs">admin@feedpulse.com / feedplusadmin</span>
          </p>
        </div>
      </div>
    </div>
  );
}
