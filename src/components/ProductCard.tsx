'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product, PublicProduct } from '@/types';
import { useBusinessConfig } from '@/hooks/useBusinessConfig';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { Eye, Check, Plus, Minus, ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  product: Product | PublicProduct;
  isUnlockedInSession?: boolean;
  onOpenUnlockModal?: (product: Product | PublicProduct) => void;
  onOpenDetailModal?: (product: Product | PublicProduct) => void;
  onAddToEnquiry: (product: Product | PublicProduct) => void;
  isInEnquiryBucket: boolean;
  bucketQuantity?: number;
  onUpdateQuantity?: (productId: string, qty: number) => void;
  onRemoveFromBucket?: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenDetailModal,
  onAddToEnquiry,
  isInEnquiryBucket,
  bucketQuantity = 1,
  onUpdateQuantity,
  onRemoveFromBucket,
}) => {
  const router = useRouter();
  const { config: BUSINESS_CONFIG } = useBusinessConfig();
  const isOutOfStock = !product.in_stock;

  const displayImage =
    (product.images && product.images[0]) ||
    product.preview_image ||
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80';

  // Extract Vol from product.volume or title regex
  const volumeTag =
    product.volume ||
    product.name.match(/vol\s*\d+/i)?.[0]?.toUpperCase() ||
    'Vol Available';

  // Direct WhatsApp query for this product
  const waMessage = `Hello Chetak Fashion! I am interested in:
- *Item Name*: ${product.name}
- *Volume*: ${volumeTag}
- *Rate*: ${product.price ? `₹${product.price}` : 'Enquire'}
Please share photos and available color sets.`;

  const whatsappUrl = `https://wa.me/${BUSINESS_CONFIG.whatsapp}?text=${encodeURIComponent(waMessage)}`;

  const handleCardClick = () => {
    router.push(`/products/${product.id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-card transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Image Thumbnail Container */}
      <div className="relative aspect-[4/5] w-full bg-gray-100 overflow-hidden">
        <Image
          src={displayImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Volume Badge Top Left */}
        <div className="absolute top-2 left-2 bg-brand-700/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm border border-brand-500/20">
          {volumeTag}
        </div>

        {/* Quick Add Floating Button on Image Hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToEnquiry(product);
          }}
          className={`absolute bottom-2 left-2 z-10 px-2.5 py-1.5 rounded-xl text-[11px] font-bold shadow-md transition-all flex items-center gap-1.5 backdrop-blur-md ${
            isInEnquiryBucket 
              ? 'bg-emerald-600 text-white border border-emerald-400/30' 
              : 'bg-white/90 hover:bg-brand-600 text-gray-900 hover:text-white border border-white/40'
          }`}
          title={isInEnquiryBucket ? 'In Enquiry Bucket' : 'Add to Enquiry List'}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>{isInEnquiryBucket ? `In List (${bucketQuantity})` : '+ Add to List'}</span>
        </button>

        {/* Multiple Photos Badge */}
        {product.images && product.images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
            📷 {product.images.length} Photos
          </div>
        )}

        {/* Featured Badge */}
        {product.is_featured && (
          <div className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
            ★ Featured
          </div>
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute top-2 right-2 bg-gray-900/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
            Out of Stock
          </div>
        )}
      </div>

      {/* Card Details */}
      <div className="p-3 flex flex-col flex-grow justify-between bg-white space-y-2">
        <div>
          {/* Category Chip & Volume info */}
          <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium mb-1">
            <span className="truncate">{product.category_name || 'Dress Material'}</span>
            <span className="text-brand-600 font-bold shrink-0">{volumeTag}</span>
          </div>

          {/* Item Name (Product Title) */}
          <h3 className="font-bold text-xs sm:text-sm text-gray-900 line-clamp-2 hover:text-brand-600 transition-colors leading-snug">
            {product.name}
          </h3>

          {/* Rate (Price) */}
          <div className="mt-1.5 flex items-baseline justify-between bg-brand-50/60 px-2 py-1 rounded-lg border border-brand-100">
            <span className="text-[11px] font-medium text-gray-600">Rate:</span>
            {product.price_visible !== false && product.price ? (
              <div className="flex items-baseline gap-0.5">
                <span className="text-xs text-brand-700 font-bold">₹</span>
                <span className="text-sm sm:text-base font-extrabold text-brand-700">{product.price.toLocaleString('en-IN')}</span>
                <span className="text-[10px] text-gray-500 font-normal">/set</span>
              </div>
            ) : (
              <span className="text-xs font-semibold text-brand-700">
                Contact for Rate
              </span>
            )}
          </div>
        </div>

        {/* Cart Action & Quantity Control Bar */}
        <div className="pt-2 border-t border-gray-100 space-y-1.5">
          {/* Primary Add To Cart / Multi-Enquiry Button */}
          {isInEnquiryBucket ? (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-1">
              <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1 pl-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Added to List
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (bucketQuantity > 1 && onUpdateQuantity) {
                      onUpdateQuantity(product.id, bucketQuantity - 1);
                    } else if (onRemoveFromBucket) {
                      onRemoveFromBucket(product.id);
                    }
                  }}
                  className="w-6 h-6 bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold rounded-lg text-xs flex items-center justify-center transition-colors"
                  title="Decrease Quantity"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-xs font-extrabold text-emerald-900 px-1">{bucketQuantity}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onUpdateQuantity) {
                      onUpdateQuantity(product.id, bucketQuantity + 1);
                    } else {
                      onAddToEnquiry(product);
                    }
                  }}
                  className="w-6 h-6 bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold rounded-lg text-xs flex items-center justify-center transition-colors"
                  title="Increase Quantity"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToEnquiry(product);
              }}
              className="w-full bg-brand-700 hover:bg-brand-800 text-white font-bold py-1.5 px-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-yellow-300" />
              <span>Add to Enquiry Cart</span>
            </button>
          )}

          {/* Action Buttons: View Details & WhatsApp Direct */}
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/products/${product.id}`);
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-1 px-2 rounded-lg text-[11px] flex items-center justify-center gap-1 transition-all"
              title="View Full Details"
            >
              <Eye className="w-3 h-3 text-brand-600" />
              <span>Details</span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1 px-2 rounded-lg text-[11px] flex items-center justify-center gap-1 shadow-sm transition-all"
              title="Enquire on WhatsApp"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 fill-white shrink-0" />
              <span>Direct WA</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

