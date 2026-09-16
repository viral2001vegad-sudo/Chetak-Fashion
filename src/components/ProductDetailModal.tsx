'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Product, PublicProduct } from '@/types';
import { BUSINESS_CONFIG } from '@/config/business';
import { useBusinessConfig } from '@/hooks/useBusinessConfig';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { X, Lock, Unlock, Check, Plus, AlertCircle, Sparkles, AlertTriangle, Share2, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | PublicProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToEnquiry: (product: Product | PublicProduct) => void;
  isInEnquiryBucket: boolean;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToEnquiry,
  isInEnquiryBucket,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (product) {
      setSelectedImageIndex(0);
      // Increment view count via API
      fetch(`/api/products/${product.id}/view`, { method: 'POST' }).catch(() => {});
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const images = (product.images && product.images.length > 0)
    ? product.images
    : [product.preview_image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80'];

  const handleSingleEnquireWhatsApp = async () => {
    // Log enquiry server-side
    await fetch('/api/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_ids: [product.id] }),
    }).catch(() => {});

    const msg = `Hello ${BUSINESS_CONFIG.name}! I am interested in this dress material item:\n\n📌 *${product.name}*\nCategory: ${product.category_name || 'Dress Material'}\n${product.price ? `Price: ₹${product.price}` : ''}\n\nPlease share availability, bulk wholesale rates, and color options.`;
    
    window.open(`https://wa.me/${BUSINESS_CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} at ${BUSINESS_CONFIG.name}`,
        url: window.location.href,
      }).catch(() => {});
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-modal overflow-hidden border border-gray-100 my-auto">
        
        {/* Top Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md backdrop-blur-md transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Main Image Gallery */}
          <div className="bg-gray-100 p-4 flex flex-col justify-between">
            <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-white shadow-inner">
              <Image
                src={images[selectedImageIndex]}
                alt={product.name}
                fill
                className="object-cover transition-all duration-300"
              />

              {/* Photo Counter Badge */}
              {images.length > 1 && (
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow">
                  Photo {selectedImageIndex + 1} of {images.length}
                </div>
              )}

              {/* Prev / Next controls if multiple images */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-2 rounded-full shadow-lg transition-transform active:scale-95"
                    title="Previous Photo"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-2 rounded-full shadow-lg transition-transform active:scale-95"
                    title="Next Photo"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Navigation strip */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      selectedImageIndex === idx ? 'border-brand-600 ring-2 ring-brand-500/30 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details Section */}
          <div className="p-5 sm:p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              {/* Category & Status Chips */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full">
                  {product.category_name || 'Dress Material'}
                </span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  product.in_stock ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                }`}>
                  {product.in_stock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              {/* Product Title */}
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
                {product.name}
              </h2>

              {/* Price */}
              <div className="py-2 border-y border-gray-100 flex items-baseline justify-between">
                {product.price_visible !== false && product.price ? (
                  <div>
                    <span className="text-xs text-gray-500 font-medium">Wholesale Rate: </span>
                    <span className="text-2xl font-bold text-brand-700 ml-1">₹{product.price.toLocaleString('en-IN')}</span>
                    <span className="text-xs text-gray-400 font-normal ml-1">/set</span>
                  </div>
                ) : (
                  <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg">
                    Price available on enquiry
                  </span>
                )}
                
                <button
                  onClick={handleShare}
                  className="text-gray-400 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
                  title="Share Design"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* Full Description */}
              <div>
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Product Details & Fabric Specifications
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.description || "Premium quality unstitched dress material set manufactured directly in Surat. Soft touch, durable fabric, ideal for boutique and retail sale."}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => onAddToEnquiry(product)}
                disabled={!product.in_stock}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  isInEnquiryBucket
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-brand-50 hover:bg-brand-100 text-brand-800 border border-brand-200'
                }`}
              >
                {isInEnquiryBucket ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-700" /> Item Added to Enquiry List
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 text-brand-700" /> Add to Multi-Product Enquiry
                  </>
                )}
              </button>

              <button
                onClick={handleSingleEnquireWhatsApp}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <WhatsAppIcon className="w-4 h-4 fill-white shrink-0" /> WhatsApp
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
