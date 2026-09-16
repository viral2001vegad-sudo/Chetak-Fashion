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

  // Extract Vol and Brand
  const brandTag =
    product.brand_name ||
    product.name.split(/[\s-(]/)[0]?.toUpperCase() ||
    'CHETAK';

  const volumeTag =
    product.volume ||
    product.name.match(/vol[\s.-]*\d+/i)?.[0]?.replace(/vol/i, 'Vol.') ||
    'Vol. 01';

  // Fabric specs parsing
  const topFabric =
    product.top_fabric ||
    product.description?.match(/top\s*:\s*([^|\n]+)/i)?.[1]?.trim() ||
    'Cotton';

  const dupattaFabric =
    product.dupatta_fabric ||
    product.description?.match(/dupatta\s*:\s*([^|\n]+)/i)?.[1]?.trim() ||
    'Cotton';

  const bottomFabric =
    product.bottom_fabric ||
    product.description?.match(/bottom\s*:\s*([^|\n]+)/i)?.[1]?.trim() ||
    'Cotton';

  // Direct WhatsApp query for this product
  const waMessage = `Hello Chetak Fashion! I am interested in:
- *Item Name*: ${product.name}
- *Volume*: ${volumeTag}
- *Rate*: ${product.price ? `₹${product.price} + GST` : 'Enquire'}
Please share photos and available color sets.`;

  const whatsappUrl = `https://wa.me/${BUSINESS_CONFIG.whatsapp}?text=${encodeURIComponent(waMessage)}`;

  const handleCardClick = () => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(`cached_product_${product.id}`, JSON.stringify(product));
      } catch (e) {}
    }
    router.push(`/products/${product.id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group relative bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-card transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
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

        {/* Top Left Brand Badge */}
        <div className="absolute top-2 left-2 bg-[#701A24] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-md shadow-sm uppercase tracking-wider">
          {brandTag}
        </div>

        {/* Top Right Volume Badge */}
        <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-md text-gray-900 text-[10px] font-black px-2.5 py-0.5 rounded-md shadow-sm border border-gray-200">
          {volumeTag}
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-gray-900 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Card Details */}
      <div className="p-3.5 flex flex-col flex-grow justify-between bg-white space-y-2">
        <div>
          {/* Product Title */}
          <h3 className="font-serif font-bold text-sm text-gray-900 line-clamp-1 hover:text-[#701A24] transition-colors">
            {product.name}
          </h3>

          {/* Fabric Breakdown Rows */}
          <div className="text-[11px] text-gray-500 font-medium mt-1 leading-relaxed space-y-0.5">
            <p className="truncate">
              <span className="text-gray-700 font-semibold">Top :</span> {topFabric} <span className="text-gray-300 mx-1">|</span> <span className="text-gray-700 font-semibold">Dupatta :</span> {dupattaFabric}
            </p>
            <p className="truncate">
              <span className="text-gray-700 font-semibold">Bottom :</span> {bottomFabric}
            </p>
          </div>

          {/* Rate / Price Row */}
          <div className="mt-2 flex items-baseline justify-between">
            {product.price_visible !== false && product.price ? (
              <div className="flex items-baseline gap-1 text-[#701A24]">
                <span className="text-sm font-bold">₹</span>
                <span className="text-lg font-black tracking-tight">{product.price.toLocaleString('en-IN')}</span>
                <span className="text-[11px] text-rose-800 font-semibold ml-0.5">+ GST</span>
              </div>
            ) : (
              <span className="text-xs font-bold text-[#701A24]">
                Contact for Wholesale Rate
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-2">
          {/* View Details Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            className="w-full border border-[#701A24] text-[#701A24] hover:bg-rose-50 text-[11px] font-bold py-1.5 px-2 rounded-xl flex items-center justify-center gap-1 transition-all"
            title="View Specs & Details"
          >
            <Eye className="w-3.5 h-3.5 text-[#701A24]" />
            <span>View Details</span>
          </button>

          {/* Direct WhatsApp Enquiry Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-[#059669] hover:bg-[#047857] text-white text-[11px] font-bold py-1.5 px-2 rounded-xl flex items-center justify-center gap-1 shadow-sm transition-all"
            title="Enquire on WhatsApp"
          >
            <WhatsAppIcon className="w-3.5 h-3.5 fill-white shrink-0" />
            <span>Enquiry</span>
          </a>
        </div>
      </div>
    </div>
  );
};

