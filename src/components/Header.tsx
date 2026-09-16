'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useBusinessConfig } from '@/hooks/useBusinessConfig';
import { Phone, ShieldCheck, Download, Search, X } from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange }) => {
  const { config: BUSINESS_CONFIG } = useBusinessConfig();
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
      <div className="bg-brand-700 text-white text-xs py-1.5 px-4 sm:px-6 lg:px-8 xl:px-10 text-center font-medium tracking-wide flex justify-between items-center max-w-[1920px] mx-auto">
        <span className="truncate">📍 Surat Wholesale Market • {BUSINESS_CONFIG.tagline}</span>
        <div className="flex items-center gap-3 shrink-0">
          <span>GSTIN: {BUSINESS_CONFIG.gstin}</span>
        </div>
      </div>

      {/* Main Branding Header */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white border border-brand-100 shadow-sm p-1.5 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
            {/* Standard img tag with explicit width/height and style constraints */}
            <img
              src="/logo.svg"
              alt={BUSINESS_CONFIG.name}
              width={56}
              height={56}
              style={{ width: '100%', height: '100%', maxWidth: '56px', maxHeight: '56px', objectFit: 'contain' }}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-brand-700 tracking-tight leading-none group-hover:text-brand-600 transition-colors">
              CHETAK FASHION<span className="text-xs font-sans text-brand-600 align-top ml-0.5">™</span>
            </h1>
            <p className="text-[11px] sm:text-xs text-gray-600 font-semibold tracking-wide mt-1 line-clamp-1">
              {BUSINESS_CONFIG.tagline}
            </p>
          </div>
        </Link>

        {/* Quick Contact & Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {isInstallable && (
            <button
              onClick={handleInstallClick}
              className="hidden sm:flex items-center gap-1.5 bg-brand-50 text-brand-700 hover:bg-brand-100 px-3 py-2 rounded-xl text-xs font-semibold border border-brand-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Install App
            </button>
          )}

          <a
            href={`tel:${BUSINESS_CONFIG.rawPhone}`}
            className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
            title="Call Store"
          >
            <Phone className="w-3.5 h-3.5 text-brand-600" />
            <span className="hidden sm:inline">Call Us</span>
          </a>

          <a
            href={`https://wa.me/${BUSINESS_CONFIG.whatsapp}?text=${encodeURIComponent("Hello Chetak Fashion! I'd like to enquire about your wholesale dress material catalogue.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-lg active:scale-95 animate-pulse"
          >
            <WhatsAppIcon className="w-4 h-4 fill-white shrink-0" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Search Bar Strip */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pb-3">
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
