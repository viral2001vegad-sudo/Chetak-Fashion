'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useBusinessConfig } from '@/hooks/useBusinessConfig';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { MapPin, Phone, Instagram, ShieldCheck, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  const { config: BUSINESS_CONFIG } = useBusinessConfig();
  return (
    <footer className="bg-gray-900 text-gray-300 pt-10 pb-8 border-t border-gray-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Brand & Address */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center overflow-hidden">
              <img
                src="/logo.svg"
                alt={BUSINESS_CONFIG.name}
                width={40}
                height={40}
                style={{ width: '100%', height: '100%', maxWidth: '40px', maxHeight: '40px', objectFit: 'contain' }}
                className="w-full h-full object-contain"
              />
            </div>
            <h3 className="font-serif text-lg font-bold text-white tracking-wide">
              {BUSINESS_CONFIG.name}
            </h3>
          </div>
          <p className="text-xs text-gray-400 font-medium leading-relaxed">
            {BUSINESS_CONFIG.tagline}
          </p>
          <div className="text-xs text-gray-400 space-y-1.5 pt-2">
            <p className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
              <span>{BUSINESS_CONFIG.address}</span>
            </p>
            <p className="text-[11px] text-gray-500 font-mono">GSTIN: {BUSINESS_CONFIG.gstin}</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
            Wholesale Inquiries & Contact
          </h4>
          <div className="space-y-2 text-xs">
            <p className="text-gray-300 font-medium">Contact Person: <span className="text-white font-bold">{BUSINESS_CONFIG.contactPerson}</span></p>
            <a
              href={`tel:${BUSINESS_CONFIG.rawPhone}`}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-brand-500" />
              <span>{BUSINESS_CONFIG.phone}</span>
            </a>
            <a
              href={`https://wa.me/${BUSINESS_CONFIG.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 fill-emerald-400 shrink-0" />
              <span>WhatsApp Direct Line</span>
            </a>
            <a
              href={BUSINESS_CONFIG.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-brand-400 hover:text-brand-300 font-semibold"
            >
              <ExternalLink className="w-3 h-3" /> Get Directions on Google Maps
            </a>
          </div>
        </div>

        {/* Links & Admin */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
            Catalogue Access
          </h4>
          <ul className="space-y-2 text-xs text-gray-400">
            <li>
              <Link href="/" className="hover:text-white transition-colors">
                Public Catalogue Grid
              </Link>
            </li>
            <li>
              <a href={BUSINESS_CONFIG.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5 text-pink-400" /> Follow on Instagram
              </a>
            </li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 pt-4 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-2">
        <p>© {new Date().getFullYear()} {BUSINESS_CONFIG.name}. All rights reserved. Surat Wholesale Market PWA.</p>
        <p>Built with Secure Password Lock Engine & Next.js 14</p>
      </div>
    </footer>
  );
};
