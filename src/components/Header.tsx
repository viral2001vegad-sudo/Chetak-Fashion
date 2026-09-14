'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BUSINESS_CONFIG } from '@/config/business';
import { Phone, MessageCircle, ShieldCheck, Download, Search, X } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      {/* Top Announcement Bar */}
      <div className="bg-brand-700 text-white text-xs py-1.5 px-4 text-center font-medium tracking-wide flex justify-between items-center max-w-7xl mx-auto">
        <span className="truncate">📍 Surat Wholesale Market • {BUSINESS_CONFIG.tagline}</span>
        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden sm:inline">GSTIN: {BUSINESS_CONFIG.gstin}</span>
          <Link 
            href="/admin/login" 
            className="hover:underline opacity-90 flex items-center gap-1 font-semibold bg-brand-800 px-2 py-0.5 rounded text-[11px]"
          >
            <ShieldCheck className="w-3 h-3" /> Admin
          </Link>
        </div>
      </div>

      {/* Main Branding Header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-12 h-12 rounded-xl bg-white border border-gray-200 shadow-sm p-1 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
            {/* Standard img tag guarantees crisp SVG rendering without Next image loader fallback */}
            <img
              src="/logo.svg"
              alt={BUSINESS_CONFIG.name}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 tracking-tight leading-none group-hover:text-brand-600 transition-colors">
              {BUSINESS_CONFIG.name}
            </h1>
            <p className="text-xs text-brand-600 font-bold uppercase tracking-wider mt-0.5">
              Surat Dress Materials
            </p>
          </div>
        </Link>

        {/* Quick Contact & PWA Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isInstallable && (
            <button
              onClick={handleInstallClick}
              className="hidden sm:flex items-center gap-1.5 bg-brand-50 text-brand-700 hover:bg-brand-100 px-3 py-1.5 rounded-lg text-xs font-semibold border border-brand-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Install PWA
            </button>
          )}

          <a
            href={`tel:${BUSINESS_CONFIG.rawPhone}`}
            className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
            title="Call Store"
          >
            <Phone className="w-3.5 h-3.5 text-brand-600" />
            <span className="hidden sm:inline">Call Us</span>
          </a>

          <a
            href={`https://wa.me/${BUSINESS_CONFIG.whatsapp}?text=${encodeURIComponent("Hello Chetak Fashion! I'd like to enquire about your wholesale dress material catalogue.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow"
          >
            {/* Official WhatsApp Vector SVG Icon */}
            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.099 4.018 4.142-1.087z"/>
            </svg>
            <span>Direct WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Search Bar Strip */}
      <div className="max-w-7xl mx-auto px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search dress materials, silk suits, cotton Kurtis, code..."
            className="w-full pl-10 pr-9 py-2 bg-gray-50 hover:bg-white focus:bg-white border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 rounded-xl text-sm transition-all outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
