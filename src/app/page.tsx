'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { PasswordUnlockModal } from '@/components/PasswordUnlockModal';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { EnquiryDrawer } from '@/components/EnquiryDrawer';
import { Product, PublicProduct, Category, EnquiryItem } from '@/types';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '@/lib/mockData';
import { Lock, Sparkles, SlidersHorizontal, Package, RefreshCw } from 'lucide-react';

export default function CataloguePage() {
  const [products, setProducts] = useState<(Product | PublicProduct)[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');

  // Session-level unlocked products map (productId -> Product)
  const [unlockedSessionMap, setUnlockedSessionMap] = useState<Record<string, Product>>({});

  // Active Modals
  const [unlockTargetProduct, setUnlockTargetProduct] = useState<Product | PublicProduct | null>(null);
  const [detailTargetProduct, setDetailTargetProduct] = useState<Product | PublicProduct | null>(null);

  // Enquiry Bucket State
  const [bucket, setBucket] = useState<EnquiryItem[]>([]);

  // Fetch initial products
  const fetchProducts = async () => {
    try {
      const res = await fetch(`/api/products?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data.products) && data.products.length > 0) {
        setProducts(data.products);
        setCategories(Array.isArray(data.categories) && data.categories.length > 0 ? data.categories : MOCK_CATEGORIES);
      } else {
        setProducts(MOCK_PRODUCTS);
        setCategories(MOCK_CATEGORIES);
      }
    } catch (err) {
      setProducts(MOCK_PRODUCTS);
      setCategories(MOCK_CATEGORIES);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    // Re-fetch when user switches back to this tab
    const handleFocus = () => fetchProducts();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Handle password unlock success
  const handleSuccessUnlock = (unlockedProd: Product) => {
    setUnlockedSessionMap((prev) => ({
      ...prev,
      [unlockedProd.id]: unlockedProd,
    }));
    // Open full detail modal immediately upon successful password entry
    setDetailTargetProduct(unlockedProd);
  };

  // Add to enquiry bucket
  const handleAddToEnquiry = (prod: Product | PublicProduct) => {
    // Determine effective product data (use unlocked session version if available)
    const effectiveProd = unlockedSessionMap[prod.id] || prod;

    setBucket((prev) => {
      const existingIdx = prev.findIndex((item) => item.product.id === effectiveProd.id);
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += 1;
        return updated;
      }
      return [...prev, { product: effectiveProd, quantity: 1 }];
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
      .map((p) => unlockedSessionMap[p.id] || p) // substitute unlocked data if available
      .filter((p) => {
        // Search Filter
        const matchesSearch =
          searchQuery.trim() === '' ||
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
  }, [products, searchQuery, selectedCategoryId, sortBy, unlockedSessionMap]);

  return (
    <div className="min-h-screen bg-bg-main text-text-primary flex flex-col justify-between selection:bg-brand-100 selection:text-brand-800">
      
      {/* Branded Header */}
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full space-y-6">
        
        {/* Hero Banner Strip */}
        <div className="relative rounded-3xl bg-gradient-to-r from-brand-800 via-brand-700 to-amber-700 p-6 sm:p-8 text-white shadow-xl overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-amber-200">
              <Sparkles className="w-3.5 h-3.5" /> Surat Direct Wholesale Manufacturers
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight">
              Exclusive Dress Material & Suit Catalogue
            </h2>
            <p className="text-xs sm:text-sm text-white/90 font-medium leading-relaxed">
              Explore our latest festival collections, pure cottons, and heavy silk suits. Some exclusive designs are password-locked for private buyers.
            </p>
          </div>
        </div>

        {/* Category Filters Pill Bar & Sort Dropdown */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm">
          
          {/* Categories Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategoryId('all')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategoryId === 'all'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Designs ({products.length})
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategoryId === cat.id
                    ? 'bg-brand-600 text-white shadow-sm'
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
              className="bg-gray-50 border border-gray-200 text-gray-700 font-semibold px-3 py-1.5 rounded-xl outline-none focus:border-brand-500"
            >
              <option value="newest">Sort: Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>

        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-80 bg-gray-200 rounded-2xl" />
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {filteredProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                isUnlockedInSession={!!unlockedSessionMap[prod.id]}
                onOpenUnlockModal={(p) => setUnlockTargetProduct(p)}
                onOpenDetailModal={(p) => setDetailTargetProduct(p)}
                onAddToEnquiry={handleAddToEnquiry}
                isInEnquiryBucket={bucket.some((item) => item.product.id === prod.id)}
              />
            ))}
          </div>
        )}

      </main>

      {/* Password Unlock Modal */}
      <PasswordUnlockModal
        product={unlockTargetProduct}
        isOpen={!!unlockTargetProduct}
        onClose={() => setUnlockTargetProduct(null)}
        onSuccessUnlock={handleSuccessUnlock}
      />

      {/* Full Detail Modal */}
      <ProductDetailModal
        product={detailTargetProduct}
        isOpen={!!detailTargetProduct}
        onClose={() => setDetailTargetProduct(null)}
        onAddToEnquiry={handleAddToEnquiry}
        isInEnquiryBucket={
          detailTargetProduct ? bucket.some((item) => item.product.id === detailTargetProduct.id) : false
        }
      />

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
