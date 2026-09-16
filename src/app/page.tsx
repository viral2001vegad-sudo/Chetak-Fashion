'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { EnquiryDrawer } from '@/components/EnquiryDrawer';
import { Product, PublicProduct, Category, EnquiryItem, Banner } from '@/types';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '@/lib/mockData';
import { Sparkles, SlidersHorizontal, Package, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
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
        const matchesCategory =
          selectedCategoryId === 'all' || p.category_id === selectedCategoryId;

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
    <div className="min-h-screen bg-bg-main text-text-primary flex flex-col justify-between selection:bg-brand-100 selection:text-brand-800">
      
      {/* Branded Header */}
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 flex-1 w-full space-y-5">
        
        {/* Dynamic Admin Managed Hero Banner Carousel */}
        {activeBanner && (
          <div className="relative rounded-3xl bg-brand-900 text-white shadow-xl overflow-hidden min-h-[200px] sm:min-h-[240px] flex items-center border border-brand-800">
            {/* Background Image Layer */}
            {activeBanner.image_url && (
              <div 
                className="absolute inset-0 bg-cover bg-center transition-all duration-700 scale-105 opacity-30"
                style={{ backgroundImage: `url(${activeBanner.image_url})` }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-brand-950 via-brand-900/90 to-transparent" />

            {/* Banner Content Container */}
            <div className="relative z-10 p-5 sm:p-8 max-w-2xl space-y-2.5">
              <div className="inline-flex items-center gap-1.5 bg-amber-400 text-brand-950 px-3 py-1 rounded-full text-[11px] sm:text-xs font-black tracking-wide uppercase shadow">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>{activeBanner.badge || 'Surat Direct Wholesale Manufacturer'}</span>
              </div>

              <h2 className="font-serif text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                {activeBanner.title || 'Surat Direct Wholesale Manufacturer'}
              </h2>

              <p className="text-xs sm:text-sm text-gray-200 font-medium leading-relaxed max-w-xl">
                {activeBanner.subtitle || 'Exclusive Dress Material & Suit Collection directly from manufacturer at wholesale factory rates.'}
              </p>

              <div className="pt-2 flex items-center gap-3">
                <a
                  href={`https://wa.me/${BUSINESS_CONFIG.whatsapp}?text=${encodeURIComponent("Hello Chetak Fashion! I'd like to place a wholesale enquiry for your dress material collection.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-95"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-white shrink-0" />
                  <span>Contact Direct Manufacturer</span>
                </a>
              </div>
            </div>

            {/* Banner Controls */}
            {banners.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentBannerIdx((prev) => (prev - 1 + banners.length) % banners.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm transition-all"
                  aria-label="Previous Banner"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentBannerIdx((prev) => (prev + 1) % banners.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm transition-all"
                  aria-label="Next Banner"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Dots */}
                <div className="absolute bottom-3 right-6 z-20 flex items-center gap-1.5">
                  {banners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentBannerIdx(idx)}
                      className={`h-2 rounded-full transition-all ${
                        currentBannerIdx === idx ? 'w-6 bg-amber-400' : 'w-2 bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Category Filters Pill Bar & Sort Dropdown */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm">
          
          {/* Categories Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategoryId('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategoryId === 'all'
                  ? 'bg-brand-700 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Collections ({products.length})
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategoryId === cat.id
                    ? 'bg-brand-700 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 font-bold px-3 py-1.5 rounded-xl outline-none focus:border-brand-500"
            >
              <option value="newest">Sort: Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>

        </div>

        {/* Products 2-Column Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 animate-pulse">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-72 bg-gray-200 rounded-2xl" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 space-y-3">
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
              className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-brand-100 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
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

      </main>

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
