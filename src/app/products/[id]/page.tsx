'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { EnquiryDrawer } from '@/components/EnquiryDrawer';
import { ProductCard } from '@/components/ProductCard';
import { Product, PublicProduct, EnquiryItem } from '@/types';
import { MOCK_PRODUCTS } from '@/lib/mockData';
import { useBusinessConfig } from '@/hooks/useBusinessConfig';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import {
  ArrowLeft,
  Lock,
  Unlock,
  MessageCircle,
  Phone,
  ShoppingBag,
  Check,
  Plus,
  Minus,
  MapPin,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Sparkles,
  Share2,
  Eye,
  PackageCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const { config: businessConfig } = useBusinessConfig();

  const [product, setProduct] = useState<Product | PublicProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<(Product | PublicProduct)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  // Search & Enquiry bucket state
  const [searchQuery, setSearchQuery] = useState('');
  const [bucket, setBucket] = useState<EnquiryItem[]>([]);

  // Password Lock State
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState('');
  const [unlockedProductData, setUnlockedProductData] = useState<Product | null>(null);

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch single product API
      const res = await fetch(`/api/products/${productId}`);
      const data = await res.json();

      let currentProd: Product | PublicProduct | null = null;
      if (data.product) {
        currentProd = data.product;
      }

      setProduct(currentProd);

      // Check session storage if unlocked previously
      if (currentProd?.is_locked) {
        const sessionUnlocked = sessionStorage.getItem(`unlocked_${productId}`);
        if (sessionUnlocked) {
          try {
            const parsed = JSON.parse(sessionUnlocked);
            setUnlockedProductData(parsed);
            setIsUnlocked(true);
          } catch (e) {
            setIsUnlocked(false);
          }
        }
      }

      // Fetch all products for related catalogue row
      const allRes = await fetch('/api/products');
      const allData = await allRes.json();
      if (Array.isArray(allData.products)) {
        setRelatedProducts(allData.products.filter((p: any) => p.id !== productId).slice(0, 4));
      } else {
        setRelatedProducts([]);
      }
    } catch (err) {
      setProduct(null);
      setRelatedProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlockPassword.trim()) return;

    setIsUnlocking(true);
    setUnlockError('');

    try {
      const res = await fetch(`/api/products/${productId}/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: unlockPassword }),
      });

      const data = await res.json();

      if (!res.ok || !data.product) {
        setUnlockError(data.message || 'Incorrect password. Access denied.');
        setIsUnlocking(false);
        return;
      }

      // Unlocked successfully!
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      setUnlockedProductData(data.product);
      setIsUnlocked(true);
      sessionStorage.setItem(`unlocked_${productId}`, JSON.stringify(data.product));
      setUnlockPassword('');
    } catch (err) {
      setUnlockError('Connection error. Please try again.');
    } finally {
      setIsUnlocking(false);
    }
  };

  // Enquiry Bucket Handlers
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

  const handleRemoveFromBucket = (id: string) => {
    setBucket((prev) => prev.filter((item) => item.product.id !== id));
  };

  const handleUpdateQuantity = (id: string, qty: number) => {
    setBucket((prev) =>
      prev.map((item) => (item.product.id === id ? { ...item, quantity: qty } : item))
    );
  };

  const handleClearBucket = () => setBucket([]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-main flex flex-col justify-between">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <div className="text-center py-32 space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-brand-600 mx-auto" />
          <p className="text-sm font-bold text-gray-700">Loading Product Specifications...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-bg-main flex flex-col justify-between">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <div className="text-center py-32 max-w-md mx-auto px-4 space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-gray-900">Product Not Found</h2>
          <p className="text-xs text-gray-500">The design volume you requested may have been unlisted or moved.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-3 rounded-2xl text-xs shadow-md transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Public Catalogue
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Active product details (merge unlocked payload if unlocked)
  const activeProd = isUnlocked && unlockedProductData ? unlockedProductData : product;

  const imagesList =
    activeProd.images && activeProd.images.length > 0
      ? activeProd.images
      : activeProd.preview_image
      ? [activeProd.preview_image]
      : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000'];

  const volumeTag =
    activeProd.volume ||
    activeProd.name.match(/vol\s*\d+/i)?.[0]?.toUpperCase() ||
    'Vol Available';

  const inBucketItem = bucket.find((b) => b.product.id === activeProd.id);

  // WhatsApp Message Text
  const waMessage = `Hello Chetak Fashion! I am interested in ordering:
- *Item Name*: ${activeProd.name}
- *Volume*: ${volumeTag}
- *Wholesale Rate*: ${activeProd.price ? `₹${activeProd.price}` : 'Enquire'}
- *Store Link*: ${typeof window !== 'undefined' ? window.location.href : ''}
Please send catalog PDF and set photos.`;

  const whatsappUrl = `https://wa.me/${businessConfig.whatsapp}?text=${encodeURIComponent(waMessage)}`;

  return (
    <div className="min-h-screen bg-bg-main flex flex-col justify-between text-gray-800">
      
      {/* Top Main Header */}
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* Floating Enquiry Bucket Drawer */}
      <EnquiryDrawer
        bucket={bucket}
        onRemoveFromBucket={handleRemoveFromBucket}
        onUpdateQuantity={handleUpdateQuantity}
        onClearBucket={handleClearBucket}
      />

      {/* Breadcrumb Navigation Strip */}
      <div className="bg-white border-b border-gray-100 py-3 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-semibold">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-gray-600 hover:text-brand-700 transition-colors bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-xl"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalogue Grid
          </Link>
          <div className="hidden sm:flex items-center gap-2 text-gray-400">
            <span>Catalogue</span>
            <span>/</span>
            <span className="text-gray-700">{activeProd.category_name || 'Dress Material'}</span>
            <span>/</span>
            <span className="text-brand-700 truncate max-w-[200px]">{activeProd.name}</span>
          </div>
        </div>
      </div>

      {/* Main Page Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 w-full flex-grow space-y-12">
        
        {/* Product Showcase Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-soft">
          
          {/* LEFT: Multi-photo Gallery (7 columns) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Main High-Res Viewer */}
            <div className="relative aspect-[4/5] w-full rounded-3xl bg-gray-100 overflow-hidden border border-gray-200 shadow-sm group">
              <Image
                src={imagesList[selectedImageIdx] || imagesList[0]}
                alt={activeProd.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Volume Tag Badge */}
              <div className="absolute top-4 left-4 bg-brand-700/95 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-brand-500/30 shadow-md">
                {volumeTag}
              </div>

              {/* Lock Badge */}
              {activeProd.is_locked && (
                <div className={`absolute top-4 right-4 text-xs font-bold px-3 py-1.5 rounded-xl backdrop-blur-md flex items-center gap-1.5 shadow-md ${
                  isUnlocked ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {isUnlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>{isUnlocked ? 'Design Unlocked' : 'Password Protected'}</span>
                </div>
              )}
            </div>

            {/* Thumbnails Row */}
            {imagesList.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`relative w-20 h-24 rounded-2xl overflow-hidden shrink-0 border-2 transition-all ${
                      selectedImageIdx === idx
                        ? 'border-brand-600 ring-2 ring-brand-600/30 scale-105 shadow-md'
                        : 'border-gray-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt={`Thumb ${idx}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            <p className="text-[11px] text-gray-400 font-medium text-center">
              💡 Tip: Tap thumbnails to view full high-definition catalog photos.
            </p>
          </div>

          {/* RIGHT: Product Details & Purchase Actions (5 columns) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            
            <div className="space-y-4">
              
              {/* Category & Status Chips */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="bg-brand-50 text-brand-700 text-xs font-bold px-3 py-1 rounded-full border border-brand-100">
                  {activeProd.category_name || 'Dress Material'}
                </span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  activeProd.in_stock ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {activeProd.in_stock ? '✓ In Stock (Surat Warehouse)' : 'Out of Stock'}
                </span>
              </div>

              {/* Title */}
              <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
                {activeProd.name}
              </h1>

              {/* Rate Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-50 via-amber-50 to-white border border-brand-100 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-gray-600 block">Surat Direct Wholesale Rate</span>
                  {activeProd.price_visible !== false && activeProd.price ? (
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-sm font-bold text-brand-700">₹</span>
                      <span className="text-2xl sm:text-3xl font-black text-brand-700">
                        {activeProd.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-gray-500 font-medium ml-1">/ Pcs Set</span>
                    </div>
                  ) : (
                    <span className="text-base font-extrabold text-brand-700 mt-1 block">
                      Contact for Rate Sheet
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-[10px] bg-brand-700 text-white font-bold px-2 py-0.5 rounded-full">GST Billing</span>
                  <span className="text-[11px] text-gray-500 block mt-1">Surat Manufacturer</span>
                </div>
              </div>

              {/* --- PASSWORD LOCK CARD (If product is locked & not unlocked yet) --- */}
              {activeProd.is_locked && !isUnlocked && (
                <div className="p-5 rounded-3xl bg-amber-50/90 border border-amber-200 space-y-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-amber-950">Password Protected Design</h4>
                      <p className="text-xs text-amber-800 leading-relaxed">
                        This exclusive boutique suit design is password protected by Chetak Fashion. Enter access password to unlock high-res photos & specs.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleUnlockSubmit} className="space-y-3">
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-600" />
                      <input
                        type="password"
                        value={unlockPassword}
                        onChange={(e) => setUnlockPassword(e.target.value)}
                        placeholder="Enter password (e.g. chetak123)"
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-amber-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                        required
                      />
                    </div>

                    {unlockError && (
                      <div className="p-2.5 bg-red-100 border border-red-200 rounded-xl text-xs text-red-800 font-semibold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>{unlockError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isUnlocking}
                      className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      {isUnlocking ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Verifying Password...
                        </>
                      ) : (
                        <>
                          <Unlock className="w-4 h-4" /> Unlock Full Design Details
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* Fabric Specs Description */}
              {(!activeProd.is_locked || isUnlocked) && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                    <PackageCheck className="w-4 h-4 text-brand-600" /> Fabric Cut & Work Specifications
                  </h3>
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/80 text-xs leading-relaxed font-medium whitespace-pre-line text-gray-700">
                    {activeProd.description || 'Full cut cotton printed suit set with dupatta.'}
                  </div>
                </div>
              )}

            </div>

            {/* ACTION BUTTONS STRIP */}
            {(!activeProd.is_locked || isUnlocked) && (
              <div className="space-y-3 pt-4 border-t border-gray-100">
                
                {/* 1. Add to Enquiry List Button */}
                {inBucketItem ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-300 rounded-2xl p-2.5">
                    <span className="text-xs font-bold text-emerald-900 flex items-center gap-2 pl-2">
                      <Check className="w-4 h-4 text-emerald-600" /> Added to Enquiry Basket
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (inBucketItem.quantity > 1) {
                            handleUpdateQuantity(activeProd.id, inBucketItem.quantity - 1);
                          } else {
                            handleRemoveFromBucket(activeProd.id);
                          }
                        }}
                        className="w-8 h-8 bg-white border border-emerald-300 text-emerald-900 font-bold rounded-xl text-sm flex items-center justify-center shadow-sm"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-black text-emerald-900 px-2">{inBucketItem.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(activeProd.id, inBucketItem.quantity + 1)}
                        className="w-8 h-8 bg-white border border-emerald-300 text-emerald-900 font-bold rounded-xl text-sm flex items-center justify-center shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleAddToEnquiry(activeProd)}
                    className="w-full py-3.5 bg-brand-700 hover:bg-brand-800 text-white rounded-2xl text-xs sm:text-sm font-extrabold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98"
                  >
                    <ShoppingBag className="w-4 h-4 text-yellow-300" />
                    <span>Add to Multi-Item Enquiry List</span>
                  </button>
                )}

                {/* 2. Direct WhatsApp Button */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98"
                >
                  <WhatsAppIcon className="w-5 h-5 fill-white shrink-0" />
                  <span>Enquire Direct on WhatsApp</span>
                </a>

                {/* 3. Call Store */}
                <a
                  href={`tel:${businessConfig.rawPhone}`}
                  className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5 text-brand-600" />
                  <span>Call Store ({businessConfig.phone})</span>
                </a>
              </div>
            )}

          </div>

        </div>

        {/* Store Location & Directions Banner */}
        <div className="bg-gradient-to-r from-gray-900 via-brand-950 to-gray-900 text-white p-6 sm:p-8 rounded-3xl shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-gray-800">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
              Surat Wholesale Showroom & Warehouse
            </span>
            <h3 className="font-serif text-xl font-bold text-white">{businessConfig.name}</h3>
            <p className="text-xs text-gray-300 flex items-start gap-2 leading-relaxed">
              <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
              <span>{businessConfig.address}</span>
            </p>
          </div>
          <a
            href={businessConfig.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-amber-400 hover:bg-amber-500 text-gray-950 px-5 py-3 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-2 shrink-0"
          >
            <ExternalLink className="w-4 h-4" /> Get Store Directions on Maps
          </a>
        </div>

        {/* Related Collections Grid */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl font-extrabold text-gray-900">
                  More Wholesale Collections
                </h2>
                <p className="text-xs text-gray-500">Explore other exclusive dress material suit designs from Surat.</p>
              </div>
              <Link
                href="/"
                className="text-xs font-bold text-brand-700 hover:underline flex items-center gap-1"
              >
                View Full Catalogue →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onOpenDetailModal={() => router.push(`/products/${prod.id}`)}
                  onAddToEnquiry={handleAddToEnquiry}
                  isInEnquiryBucket={bucket.some((b) => b.product.id === prod.id)}
                  bucketQuantity={bucket.find((b) => b.product.id === prod.id)?.quantity || 1}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemoveFromBucket={handleRemoveFromBucket}
                />
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Main Footer */}
      <Footer />
    </div>
  );
}
