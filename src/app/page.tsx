'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { EnquiryDrawer } from '@/components/EnquiryDrawer';
import { Product, PublicProduct, Category, EnquiryItem, Banner } from '@/types';
import {
  Sparkles,
  SlidersHorizontal,
  Package,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Factory,
  Award,
  Star,
  Truck,
  MapPin,
  HeartHandshake,
  LayoutGrid,
  ArrowRight,
  Phone,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { BUSINESS_CONFIG } from '@/config/business';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';

export default function CataloguePage() {
  const [products, setProducts] = useState<(Product | PublicProduct)[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentBannerIdx, setCurrentBannerIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');

  // Enquiry Bucket State
  const [bucket, setBucket] = useState<EnquiryItem[]>([]);

  // Fetch products & banners
  const fetchProductsAndBanners = async () => {
    try {
      // Fetch Products
      const res = await fetch(`/api/products?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data.products)) {
        setProducts(data.products);
        setCategories(Array.isArray(data.categories) ? data.categories : []);
      } else {
        setProducts([]);
        setCategories([]);
      }

      // Fetch Hero Banners
      const bRes = await fetch(`/api/banners?t=${Date.now()}`, { cache: 'no-store' });
      const bData = await bRes.json();
      if (Array.isArray(bData.banners)) {
        setBanners(bData.banners.filter((b: Banner) => b.is_active));
      }
    } catch (err) {
      setProducts([]);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsAndBanners();

    const handleFocus = () => fetchProductsAndBanners();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Banner Auto-slider effect
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIdx((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  // Add to enquiry bucket
  const handleAddToEnquiry = (prod: Product | PublicProduct) => {
    setBucket((prev) => {
      const existingIdx = prev.findIndex((item) => item.product.id === prod.id);
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += 1;
        return updated;
      }
      return [...prev, { product: prod, quantity: 1 }];
    });
  };

  const handleRemoveFromBucket = (productId: string) => {
    setBucket((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleUpdateQuantity = (productId: string, qty: number) => {
    setBucket((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: qty } : item
      )
    );
  };

  const handleClearBucket = () => {
    setBucket([]);
  };

  // Filtered & Sorted products list
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search Filter
        const matchesSearch =
          searchQuery.trim() === '' ||
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.volume && p.volume.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));

        // Category Filter
        let matchesCategory = selectedCategoryId === 'all';
        if (!matchesCategory) {
          const targetCat = categories.find((c) => c.id === selectedCategoryId);
          const targetCatName = targetCat ? targetCat.name.toLowerCase().replace('dress material', '').trim() : '';

          matchesCategory = Boolean(
            p.category_id === selectedCategoryId ||
            (targetCatName !== '' && (
              (p.category_name && p.category_name.toLowerCase().includes(targetCatName)) ||
              p.name.toLowerCase().includes(targetCatName) ||
              (p.description && p.description.toLowerCase().includes(targetCatName))
            ))
          );
        }

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') {
          return (a.price || 0) - (b.price || 0);
        }
        if (sortBy === 'price-desc') {
          return (b.price || 0) - (a.price || 0);
        }
        return 0; // Default order
      });
  }, [products, searchQuery, selectedCategoryId, sortBy]);

  const activeBanner = banners.length > 0 ? banners[currentBannerIdx] : null;

  return (
    <div className="min-h-screen bg-[#FAF6F7] text-gray-900 flex flex-col justify-between selection:bg-rose-100 selection:text-rose-900">
      
      {/* Branded Header */}
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* Main Content Area */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1 w-full space-y-6">
        
        {/* Dynamic Admin Hero Banner Carousel */}
        {activeBanner && (
          <div className="relative rounded-3xl bg-[#701A24] text-white shadow-xl overflow-hidden min-h-[180px] sm:min-h-[220px] flex items-center border border-rose-900/50">
            {activeBanner.image_url && (
              <div 
                className="absolute inset-0 bg-cover bg-center transition-all duration-700 opacity-40 scale-105"
                style={{ backgroundImage: `url(${activeBanner.image_url})` }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-[#701A24] via-[#701A24]/85 to-transparent" />

            <div className="relative z-10 p-5 sm:p-8 max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-1.5 bg-amber-400 text-gray-950 px-3 py-0.5 rounded-full text-[10px] sm:text-xs font-black tracking-wide uppercase shadow">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>{activeBanner.badge || 'SURAT DIRECT MANUFACTURER'}</span>
              </div>

              <h2 className="font-serif text-xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                {activeBanner.title || 'Surat Direct Wholesale Manufacturer'}
              </h2>

              <p className="text-xs sm:text-sm text-rose-100 font-medium leading-relaxed max-w-xl">
                {activeBanner.subtitle || 'Exclusive Dress Material & Suit Collection directly from manufacturer at wholesale factory rates.'}
              </p>
            </div>
          </div>
        )}

        {/* 1. TOP CATEGORY STORIES TILE ROW (Matching user screenshot) */}
        <div className="bg-white p-4 rounded-3xl border border-rose-100/80 shadow-soft space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-extrabold text-[#701A24] uppercase tracking-wider">
              Browse Catalogue Categories
            </span>
            <div className="flex items-center gap-2 text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-gray-700 font-bold px-2.5 py-1 rounded-xl outline-none text-xs"
              >
                <option value="newest">Sort: Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-2 pt-1 scrollbar-none">
            {/* New Launch Story Tile */}
            <button
              onClick={() => setSelectedCategoryId('all')}
              className={`flex flex-col items-center gap-2 group shrink-0 transition-all ${
                selectedCategoryId === 'all' ? 'scale-105' : 'opacity-80 hover:opacity-100'
              }`}
            >
              <div className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden p-1 bg-[#FDF4F5] border-2 transition-all ${
                selectedCategoryId === 'all' ? 'border-[#701A24] ring-2 ring-rose-500/20 shadow-md' : 'border-rose-100'
              }`}>
                <div className="relative w-full h-full rounded-xl overflow-hidden bg-[#701A24]/5">
                  <Image
                    src={(products[0]?.images && products[0].images[0]) || products[0]?.preview_image || '/logo.svg'}
                    alt="New Launch"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-1 left-1 bg-[#701A24] text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                    NEW
                  </div>
                </div>
              </div>
              <span className={`text-xs font-bold ${selectedCategoryId === 'all' ? 'text-[#701A24]' : 'text-gray-700'}`}>
                New Launch
              </span>
            </button>

            {/* Dynamic DB Categories directly from Supabase */}
            {categories.map((cat) => {
              const catProd = products.find((p) => p.category_id === cat.id || (p.category_name && p.category_name.toLowerCase().includes(cat.name.toLowerCase())) || p.name.toLowerCase().includes(cat.name.toLowerCase()));
              const catImage = cat.image_url || (catProd?.images && catProd.images[0]) || catProd?.preview_image || (products[0]?.images && products[0].images[0]) || '/logo.svg';
              const isSelected = selectedCategoryId === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`flex flex-col items-center gap-2 group shrink-0 transition-all ${
                    isSelected ? 'scale-105' : 'opacity-85 hover:opacity-100'
                  }`}
                >
                  <div className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden p-1 bg-[#FDF4F5] border-2 transition-all ${
                    isSelected ? 'border-[#701A24] ring-2 ring-rose-500/20 shadow-md' : 'border-rose-100'
                  }`}>
                    <div className="relative w-full h-full rounded-xl overflow-hidden bg-[#701A24]/5">
                      <Image
                        src={catImage}
                        alt={cat.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  </div>
                  <span className={`text-xs font-bold ${isSelected ? 'text-[#701A24]' : 'text-gray-700'}`}>
                    {cat.name}
                  </span>
                </button>
              );
            })}

            {/* All Collections Tile */}
            <button
              onClick={() => { setSelectedCategoryId('all'); setSearchQuery(''); }}
              className="flex flex-col items-center gap-2 group shrink-0"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#FDF4F5] border-2 border-rose-100 flex items-center justify-center text-[#701A24] group-hover:bg-[#701A24] group-hover:text-white transition-all shadow-sm">
                <LayoutGrid className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-gray-700 group-hover:text-[#701A24]">
                All Collections
              </span>
            </button>
          </div>
        </div>

        {/* 2. SECTION HEADER BAR (Dark Maroon Strip matching screenshot) */}
        <div className="bg-[#701A24] text-white px-5 py-3 rounded-2xl shadow-sm flex items-center justify-between border border-rose-950">
          <h2 className="font-serif text-lg sm:text-xl font-bold flex items-center gap-2 tracking-wide">
            <span className="text-amber-400">✦</span> New Launch Collections
          </h2>
          <button
            onClick={() => { setSelectedCategoryId('all'); setSearchQuery(''); }}
            className="text-xs font-bold text-white/90 hover:text-white flex items-center gap-1 bg-white/10 hover:bg-white/20 px-3 py-1 rounded-xl transition-all"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3. PRODUCTS CATALOGUE GRID (3 Columns Desktop matching screenshot) */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 bg-gray-200 rounded-3xl" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-rose-100 space-y-3 shadow-soft">
            <Package className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-base font-bold text-gray-800">No dress materials found</h3>
            <p className="text-xs text-gray-500">
              Try adjusting your search query or selected category filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategoryId('all');
              }}
              className="inline-flex items-center gap-1.5 bg-rose-50 text-[#701A24] px-4 py-2 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredProducts.map((prod) => {
              const bucketItem = bucket.find((item) => item.product.id === prod.id);
              return (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onAddToEnquiry={handleAddToEnquiry}
                  isInEnquiryBucket={!!bucketItem}
                  bucketQuantity={bucketItem?.quantity || 1}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemoveFromBucket={handleRemoveFromBucket}
                />
              );
            })}
          </div>
        )}

        {/* 4. VALUE PROPOSITION FEATURE STRIP (Matching screenshot) */}
        <div className="bg-[#FAF0F2] border border-rose-100/90 rounded-3xl p-6 shadow-soft">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-center">
            <div className="flex flex-col items-center gap-1.5 p-2">
              <div className="w-10 h-10 rounded-2xl bg-white text-[#701A24] shadow-sm flex items-center justify-center">
                <Factory className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-800">Manufacturer</span>
            </div>

            <div className="flex flex-col items-center gap-1.5 p-2">
              <div className="w-10 h-10 rounded-2xl bg-white text-[#701A24] shadow-sm flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-800">Premium Quality</span>
            </div>

            <div className="flex flex-col items-center gap-1.5 p-2">
              <div className="w-10 h-10 rounded-2xl bg-white text-[#701A24] shadow-sm flex items-center justify-center">
                <Star className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-800">Latest Collections</span>
            </div>

            <div className="flex flex-col items-center gap-1.5 p-2">
              <div className="w-10 h-10 rounded-2xl bg-white text-[#701A24] shadow-sm flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-800">Fast Dispatch</span>
            </div>

            <div className="flex flex-col items-center gap-1.5 p-2">
              <div className="w-10 h-10 rounded-2xl bg-white text-[#701A24] shadow-sm flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-800">Pan India Supply</span>
            </div>

            <div className="flex flex-col items-center gap-1.5 p-2">
              <div className="w-10 h-10 rounded-2xl bg-white text-[#701A24] shadow-sm flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-800">Trusted Business Partner</span>
            </div>
          </div>
        </div>



      </main>

      {/* 6. BOTTOM STICKY DARK MAROON CONTACT STRIP (Matching screenshot) */}
      <div className="bg-[#60121B] text-white py-3 px-4 shadow-lg border-t border-rose-950 text-xs font-semibold">
        <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-3 text-center sm:text-left">
          <a href={`tel:${BUSINESS_CONFIG.rawPhone}`} className="flex items-center gap-1.5 hover:text-amber-300 transition-colors mx-auto sm:mx-0">
            <Phone className="w-3.5 h-3.5 text-rose-300" />
            <span>{BUSINESS_CONFIG.phone}</span>
          </a>

          <a href={`https://wa.me/${BUSINESS_CONFIG.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-emerald-300 transition-colors mx-auto sm:mx-0">
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Chat on WhatsApp</span>
          </a>

          <div className="flex items-center gap-1.5 text-rose-100 mx-auto sm:mx-0">
            <MapPin className="w-3.5 h-3.5 text-rose-300" />
            <span>Surat, Gujarat</span>
          </div>

          <div className="text-[11px] text-rose-200 font-mono mx-auto sm:mx-0">
            GSTIN : {BUSINESS_CONFIG.gstin}
          </div>
        </div>
      </div>

      {/* Multi-Product WhatsApp Enquiry Floating Drawer */}
      <EnquiryDrawer
        bucket={bucket}
        onRemoveFromBucket={handleRemoveFromBucket}
        onUpdateQuantity={handleUpdateQuantity}
        onClearBucket={handleClearBucket}
      />

      {/* Branded Footer */}
      <Footer />

    </div>
  );
}
