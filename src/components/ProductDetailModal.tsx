'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Product, PublicProduct } from '@/types';
import { BUSINESS_CONFIG } from '@/config/business';
import { useBusinessConfig } from '@/hooks/useBusinessConfig';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { getYouTubeEmbedUrl, isPdfUrl } from '@/lib/media';
import { parseCustomFields, filterValidCustomFields } from '@/lib/customFields';
import {
  X,
  Lock,
  Unlock,
  Check,
  Plus,
  AlertCircle,
  Sparkles,
  AlertTriangle,
  Share2,
  ChevronLeft,
  ChevronRight,
  Video,
  FileText,
  ExternalLink,
  ImageIcon,
  Maximize2,
  Star
} from 'lucide-react';

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
  const [activeMediaTab, setActiveMediaTab] = useState<'photos' | 'video' | 'pdf'>('photos');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedImageIndex(0);
      setActiveMediaTab('photos');
      // Increment view count via API
      fetch(`/api/products/${product.id}/view`, { method: 'POST' }).catch(() => {});
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const images = (product.images && product.images.length > 0)
    ? product.images
    : [product.preview_image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80'];

  const youtubeEmbedUrl = getYouTubeEmbedUrl(product.youtube_url);
  const hasPdfCatalog = isPdfUrl(product.pdf_url);

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
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-modal overflow-hidden border border-gray-100 my-auto max-h-[92vh] flex flex-col">
        
        {/* Top Header & Floating Close Button */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full">
              {product.category_name || 'Dress Material'}
            </span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              product.in_stock ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
            }`}>
              {product.in_stock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 p-2 rounded-full transition-all"
            title="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Switcher Tab Strip (Photos / YouTube Video / PDF Catalog) */}
        {(youtubeEmbedUrl || hasPdfCatalog) && (
          <div className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-50 border-b border-gray-200 shrink-0 overflow-x-auto">
            <button
              onClick={() => setActiveMediaTab('photos')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeMediaTab === 'photos'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <ImageIcon className="w-4 h-4" /> Photos ({images.length})
            </button>

            {youtubeEmbedUrl && (
              <button
                onClick={() => setActiveMediaTab('video')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  activeMediaTab === 'video'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <Video className="w-4 h-4 text-red-500 fill-red-500" /> Watch Video
              </button>
            )}

            {hasPdfCatalog && (
              <button
                onClick={() => setActiveMediaTab('pdf')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  activeMediaTab === 'pdf'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <FileText className="w-4 h-4 text-blue-500" /> Catalog PDF
              </button>
            )}
          </div>
        )}

        <div className="overflow-y-auto flex-grow p-4 sm:p-6">
          
          {/* TAB 1: YOUTUBE VIDEO PLAYER IN WEB */}
          {activeMediaTab === 'video' && youtubeEmbedUrl ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Video className="w-5 h-5 text-red-600" /> {product.name} - Product Lookbook Video
                </h3>
                <span className="text-xs bg-red-100 text-red-800 font-bold px-2.5 py-1 rounded-full">
                  HD In-Web Video Player
                </span>
              </div>
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg border border-gray-200">
                <iframe
                  src={youtubeEmbedUrl}
                  title={`${product.name} Video`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
              <p className="text-xs text-gray-500 text-center font-medium">
                ▶ Video plays directly inside Chetak Fashion Web Catalog without opening YouTube.
              </p>
            </div>
          ) : activeMediaTab === 'pdf' && hasPdfCatalog && product.pdf_url ? (
            /* TAB 2: EMBEDDED PDF CATALOG VIEWER IN WEB */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" /> Digital PDF Catalog & Rate Card
                </h3>
                <a
                  href={product.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-blue-700 hover:text-blue-900 underline flex items-center gap-1"
                >
                  <ExternalLink className="w-4 h-4" /> Open Full Screen PDF
                </a>
              </div>
              <div className="w-full h-[500px] rounded-2xl overflow-hidden bg-gray-100 border border-gray-300 shadow-inner">
                <iframe
                  src={`${product.pdf_url}#toolbar=1`}
                  title={`${product.name} PDF Catalog`}
                  className="w-full h-full rounded-2xl"
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                <span>📄 Embedded PDF Viewer - Scroll to view full catalog pages.</span>
                <a
                  href={product.pdf_url}
                  download
                  className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg font-bold hover:bg-blue-100"
                >
                  Download PDF
                </a>
              </div>
            </div>
          ) : (
            /* TAB 3: DEFAULT PHOTOS GALLERY & DETAILS GRID */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Main Image Gallery */}
              <div className="bg-gray-100 p-4 flex flex-col justify-between rounded-2xl">
                <div
                  className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-white shadow-inner cursor-pointer group"
                  onClick={() => setIsLightboxOpen(true)}
                >
                  <Image
                    src={images[selectedImageIndex] || images[0]}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Photo Counter Badge */}
                  {images.length > 1 && (
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                      <Maximize2 className="w-3 h-3 text-yellow-300" />
                      <span>Photo {selectedImageIndex + 1} of {images.length}</span>
                    </div>
                  )}

                  {/* Prev / Next controls if multiple images */}
                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-2 rounded-full shadow-lg transition-transform active:scale-95 z-10"
                        title="Previous Photo (<)"
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-900" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-2 rounded-full shadow-lg transition-transform active:scale-95 z-10"
                        title="Next Photo (>)"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-900" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnail Navigation strip */}
                {images.length > 1 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none justify-center">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
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
              <div className="flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  
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

                  {/* Media Shortcuts (if Video or PDF attached) */}
                  {(youtubeEmbedUrl || hasPdfCatalog) && (
                    <div className="flex items-center gap-2 py-1">
                      {youtubeEmbedUrl && (
                        <button
                          onClick={() => setActiveMediaTab('video')}
                          className="bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-red-200 flex items-center gap-1.5 transition-all"
                        >
                          <Video className="w-3.5 h-3.5 text-red-600" /> Play Video
                        </button>
                      )}
                      {hasPdfCatalog && (
                        <button
                          onClick={() => setActiveMediaTab('pdf')}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-blue-200 flex items-center gap-1.5 transition-all"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-600" /> View PDF Catalog
                        </button>
                      )}
                    </div>
                  )}

                  {/* Full Description */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Product Details & Fabric Specifications
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                      {product.description || "Premium quality unstitched dress material set manufactured directly in Surat. Soft touch, durable fabric, ideal for boutique and retail sale."}
                    </p>
                  </div>

                  {/* Dynamic Custom Specifications Badges / Grid */}
                  {filterValidCustomFields(product.custom_fields).length > 0 && (
                    <div className="pt-2 border-t border-gray-100 space-y-2">
                      <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Custom Product Specs
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {filterValidCustomFields(product.custom_fields).map((cf, idx) => (
                          <div key={idx} className="bg-amber-50/80 border border-amber-200/80 p-2 rounded-xl text-xs">
                            <span className="text-[10px] font-bold text-amber-900 uppercase block">{cf.label}</span>
                            <span className="font-semibold text-gray-800 leading-snug block">{cf.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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

                  {BUSINESS_CONFIG.reviewUrl && (
                    <a
                      href={BUSINESS_CONFIG.reviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                    >
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Rate & Review Store on Google
                    </a>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* FULL-SCREEN IMAGE LIGHTBOX MODAL WITH < AND > ARROWS */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-fade-in select-none">
          {/* Top Bar: Title, Counter & Close */}
          <div className="flex items-center justify-between text-white border-b border-white/10 pb-3.5 z-20">
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg">{product.name}</h3>
              <p className="text-xs text-gray-400">
                Photo {selectedImageIndex + 1} of {images.length} • Tap X to close
              </p>
            </div>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full transition-colors cursor-pointer"
              title="Close Full Screen"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Centered Large Photo with Big < > Navigation Arrows */}
          <div className="relative flex-1 flex items-center justify-center my-3 overflow-hidden">
            {images.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
                }}
                className="absolute left-2 sm:left-6 z-30 bg-white/20 hover:bg-white/40 text-white p-3.5 sm:p-4 rounded-full backdrop-blur-md transition-all active:scale-90 shadow-2xl border border-white/20 cursor-pointer"
                title="Previous Image (<)"
              >
                <ChevronLeft className="w-7 h-7 sm:w-8 sm:h-8" />
              </button>
            )}

            <div className="relative w-full h-full max-w-5xl max-h-[75vh] flex items-center justify-center">
              <Image
                src={images[selectedImageIndex] || images[0]}
                alt={product.name}
                fill
                className="object-contain"
                priority
              />
            </div>

            {images.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
                }}
                className="absolute right-2 sm:right-6 z-30 bg-white/20 hover:bg-white/40 text-white p-3.5 sm:p-4 rounded-full backdrop-blur-md transition-all active:scale-90 shadow-2xl border border-white/20 cursor-pointer"
                title="Next Image (>)"
              >
                <ChevronRight className="w-7 h-7 sm:w-8 sm:h-8" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Navigation Strip */}
          {images.length > 1 && (
            <div className="flex items-center justify-center gap-2.5 overflow-x-auto pt-3 border-t border-white/10 z-20 scrollbar-none">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-16 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    selectedImageIndex === idx
                      ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105 shadow-xl'
                      : 'border-white/20 opacity-50 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt={`Thumb ${idx}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

