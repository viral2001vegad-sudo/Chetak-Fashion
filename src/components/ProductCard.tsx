'use client';

import React from 'react';
import Image from 'next/image';
import { Product, PublicProduct } from '@/types';
import { Lock, Eye, Plus, Check, ShieldAlert, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product | PublicProduct;
  isUnlockedInSession: boolean;
  onOpenUnlockModal: (product: Product | PublicProduct) => void;
  onOpenDetailModal: (product: Product | PublicProduct) => void;
  onAddToEnquiry: (product: Product | PublicProduct) => void;
  isInEnquiryBucket: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isUnlockedInSession,
  onOpenUnlockModal,
  onOpenDetailModal,
  onAddToEnquiry,
  isInEnquiryBucket,
}) => {
  const isLocked = product.is_locked && !isUnlockedInSession;
  const isOutOfStock = !product.in_stock;

  const displayImage = isLocked
    ? product.preview_image || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80'
    : (product.images && product.images[0]) || product.preview_image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80';

  const handleCardClick = () => {
    if (isLocked) {
      onOpenUnlockModal(product);
    } else {
      onOpenDetailModal(product);
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-card transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image Thumbnail Container */}
      <div 
        onClick={handleCardClick}
        className="relative aspect-[4/5] w-full bg-gray-100 overflow-hidden cursor-pointer"
      >
        <Image
          src={displayImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
            isLocked ? 'blur-[3px] brightness-90 scale-105' : ''
          }`}
        />

        {/* Lock Pill Badge (High contrast Gold pill always visible on locked card) */}
        {isLocked && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 text-center transition-opacity">
            <div className="bg-accent text-gray-900 font-bold px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 shadow-lg border border-yellow-200 animate-pulse">
              <Lock className="w-3.5 h-3.5" />
              <span>PRIVATE DESIGN</span>
            </div>
            <p className="text-white text-xs font-medium mt-2 drop-shadow">
              Tap to enter password
            </p>
          </div>
        )}

        {/* Unlocked / Unlocked Session Badge */}
        {!isLocked && product.is_locked && (
          <div className="absolute top-2.5 left-2.5 bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow">
            <Sparkles className="w-3 h-3" /> Unlocked
          </div>
        )}

        {/* Featured Badge */}
        {product.is_featured && !isLocked && (
          <div className="absolute top-2.5 left-2.5 bg-brand-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow">
            Featured
          </div>
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute top-2.5 right-2.5 bg-gray-900/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
            Out of Stock
          </div>
        )}
      </div>

      {/* Card Details */}
      <div className="p-3.5 flex flex-col flex-grow justify-between bg-white">
        <div>
          {/* Category Chip */}
          <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium mb-1">
            <span>{product.category_name || 'Dress Material'}</span>
          </div>

          {/* Product Title */}
          <h3 
            onClick={handleCardClick}
            className="font-semibold text-sm text-gray-900 line-clamp-2 hover:text-brand-600 transition-colors cursor-pointer leading-snug"
          >
            {product.name}
          </h3>

          {/* Price / Locked status */}
          <div className="mt-2 flex items-baseline justify-between">
            {isLocked ? (
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Password Locked
              </span>
            ) : product.price_visible !== false && product.price ? (
              <div className="flex items-baseline gap-1">
                <span className="text-xs text-gray-500 font-medium">₹</span>
                <span className="text-base font-bold text-brand-700">{product.price.toLocaleString('en-IN')}</span>
                <span className="text-[10px] text-gray-400 font-normal">/set</span>
              </div>
            ) : (
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                Price on Enquiry
              </span>
            )}
          </div>
        </div>

        {/* Action Button: Add to Enquiry Bucket or Unlock Request */}
        <div className="mt-3 pt-2.5 border-t border-gray-100">
          {isLocked ? (
            <button
              onClick={() => onOpenUnlockModal(product)}
              className="w-full bg-accent hover:bg-accent-hover text-gray-950 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-[0.98]"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Unlock to View</span>
            </button>
          ) : (
            <button
              onClick={() => onAddToEnquiry(product)}
              disabled={isOutOfStock}
              className={`w-full font-semibold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all ${
                isOutOfStock
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : isInEnquiryBucket
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold'
                  : 'bg-brand-50 hover:bg-brand-600 text-brand-700 hover:text-white border border-brand-200 active:scale-[0.98]'
              }`}
            >
              {isInEnquiryBucket ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Added to Enquiry</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Enquiry</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
