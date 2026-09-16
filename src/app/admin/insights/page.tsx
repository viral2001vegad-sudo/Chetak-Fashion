'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import { BUSINESS_CONFIG } from '@/config/business';
import { getDeviceId } from '@/lib/device/deviceId';
import {
  BarChart3,
  TrendingUp,
  Eye,
  MessageCircle,
  ArrowLeft,
  Calendar,
  Lock,
  Package,
  Sparkles
} from 'lucide-react';

export default function AdminInsightsPage() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'all'>('7d');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<{
    totalVisits: number;
    totalEnquiries: number;
    totalProducts: number;
    hiddenProducts: number;
    lockedProducts: number;
    outOfStockProducts: number;
    topViewed: Product[];
    topEnquired: Product[];
  }>({
    totalVisits: 0,
    totalEnquiries: 0,
    totalProducts: 0,
    hiddenProducts: 0,
    lockedProducts: 0,
    outOfStockProducts: 0,
    topViewed: [],
    topEnquired: [],
  });

  useEffect(() => {
    const token = localStorage.getItem('chetak_admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    async function fetchInsights() {
      setIsLoading(true);
      try {
        const deviceId = getDeviceId();
        const verifyRes = await fetch('/api/admin/device/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, deviceId }),
        });

        const verifyData = await verifyRes.json();
        if (!verifyRes.ok || !verifyData.authorized) {
          localStorage.removeItem('chetak_admin_token');
          router.push('/admin/login');
          return;
        }

        const res = await fetch('/api/admin/insights');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Fetch insights error:', err);
        localStorage.removeItem('chetak_admin_token');
        router.push('/admin/login');
      } finally {
        setIsLoading(false);
      }
    }

    fetchInsights();
  }, [router]);

  return (
    <div className="min-h-screen bg-bg-main text-text-primary flex flex-col pb-12">
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="text-gray-500 hover:text-gray-900 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-serif text-lg font-bold text-gray-900 leading-none">
                Catalogue Insights & Analytics
              </h1>
              <span className="text-[10px] font-semibold text-brand-700">Real-Time Business Performance</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs bg-gray-100 px-2.5 py-1 rounded-xl">
            <Calendar className="w-3.5 h-3.5 text-gray-500" />
            <select
              value={dateRange}
              onChange={(e: any) => setDateRange(e.target.value)}
              className="bg-transparent font-semibold text-gray-700 outline-none cursor-pointer"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
      </header>

      {/* Insights Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6 w-full flex-1">
        
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
              <span>Catalogue Visits</span>
              <Eye className="w-4 h-4 text-brand-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {isLoading ? '...' : stats.totalVisits.toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> Page view analytics
            </span>
          </div>

          <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
              <span>WhatsApp Enquiries</span>
              <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-emerald-950">
              {isLoading ? '...' : stats.totalEnquiries.toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-emerald-700 font-semibold">
              Highest intent buying leads
            </span>
          </div>

          <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-100 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-amber-900">
              <span>Locked Private Items</span>
              <Lock className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-amber-950">
              {isLoading ? '...' : stats.lockedProducts}
            </p>
            <span className="text-[10px] text-amber-700 font-semibold">
              Password protected designs
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
              <span>Active Catalogue</span>
              <Package className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {isLoading ? '...' : stats.totalProducts - stats.hiddenProducts}
            </p>
            <span className="text-[10px] text-gray-500 font-medium">
              {stats.hiddenProducts} hidden items
            </span>
          </div>

        </div>

        {/* Analytics Breakdown Tables/Lists */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Most Enquired Products (Business Critical) */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-gray-900">Top Enquired Products</h3>
                  <p className="text-[11px] text-gray-500">Most requested dress materials on WhatsApp</p>
                </div>
              </div>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>

            <div className="space-y-3">
              {isLoading ? (
                <div className="text-center py-6 text-xs text-gray-400">Loading metrics...</div>
              ) : stats.topEnquired.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-400">No enquiry logs recorded yet.</div>
              ) : (
                stats.topEnquired.map((prod, idx) => {
                  const image = (prod.images && prod.images[0]) || prod.preview_image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80';
                  
                  return (
                    <div key={prod.id} className="flex items-center justify-between gap-3 p-2.5 rounded-2xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-mono text-xs font-bold text-gray-400 w-4 text-center">{idx + 1}</span>
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                          <Image src={image} alt="" fill className="object-cover" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-xs text-gray-900 line-clamp-1">{prod.name}</h4>
                          <span className="text-[10px] text-gray-500">{prod.category_name || 'Dress Material'}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          {prod.enquiry_count || 0} enquiries
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Most Viewed Products */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-brand-100 text-brand-800 rounded-lg">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-gray-900">Most Viewed Products</h3>
                  <p className="text-[11px] text-gray-500">Highest customer interest & card opens</p>
                </div>
              </div>
              <BarChart3 className="w-4 h-4 text-brand-600" />
            </div>

            <div className="space-y-3">
              {isLoading ? (
                <div className="text-center py-6 text-xs text-gray-400">Loading metrics...</div>
              ) : stats.topViewed.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-400">No view counts recorded yet.</div>
              ) : (
                stats.topViewed.map((prod, idx) => {
                  const image = (prod.images && prod.images[0]) || prod.preview_image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80';

                  return (
                    <div key={prod.id} className="flex items-center justify-between gap-3 p-2.5 rounded-2xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-mono text-xs font-bold text-gray-400 w-4 text-center">{idx + 1}</span>
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                          <Image src={image} alt="" fill className="object-cover" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-xs text-gray-900 line-clamp-1">{prod.name}</h4>
                          <span className="text-[10px] text-gray-500">{prod.category_name || 'Dress Material'}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
                          {prod.view_count || 0} views
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </main>

    </div>
  );
}
