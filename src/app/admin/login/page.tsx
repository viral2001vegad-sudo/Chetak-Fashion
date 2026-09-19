'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BUSINESS_CONFIG } from '@/config/business';
import { getDeviceId } from '@/lib/device/deviceId';
import { ShieldCheck, Lock, Mail, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = Router();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const deviceId = getDeviceId();

      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, deviceId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Invalid admin credentials. Access denied!');
        setIsLoading(false);
        return;
      }

      // Save authenticated session token
      localStorage.setItem('chetak_admin_token', data.token || 'authenticated-admin-session');
      router.push('/admin');
    } catch (err) {
      setErrorMsg('Server connection error. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-modal border border-gray-100 p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="relative w-16 h-16 rounded-2xl bg-white border border-gray-200 shadow-sm p-2 mx-auto flex items-center justify-center">
            <img
              src={BUSINESS_CONFIG.logoPath || "/logo.png"}
              alt={BUSINESS_CONFIG.name}
              width={64}
              height={64}
              style={{ width: '100%', height: '100%', maxWidth: '64px', maxHeight: '64px', objectFit: 'contain' }}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Authorized Admin Area
          </div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">
            {BUSINESS_CONFIG.name} Admin Portal
          </h1>
          <p className="text-xs text-gray-500">
            Sign in to manage dress material stock, lock exclusive designs & view insights.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Authenticating...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" /> Sign In to Admin Panel
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center border-t border-gray-100">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-brand-700 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Public Catalogue
          </Link>
        </div>

      </div>
    </div>
  );
}

function Router() {
  return useRouter();
}
