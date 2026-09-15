'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { EnquiryItem, Product, PublicProduct } from '@/types';
import { useBusinessConfig } from '@/hooks/useBusinessConfig';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { ShoppingBag, X, Trash2, ChevronRight, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface EnquiryDrawerProps {
  bucket: EnquiryItem[];
  onRemoveFromBucket: (productId: string) => void;
  onUpdateQuantity: (productId: string, qty: number) => void;
  onClearBucket: () => void;
}

export const EnquiryDrawer: React.FC<EnquiryDrawerProps> = ({
  bucket,
  onRemoveFromBucket,
  onUpdateQuantity,
  onClearBucket,
}) => {
  const { config: BUSINESS_CONFIG } = useBusinessConfig();
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const totalItemsCount = bucket.reduce((sum, item) => sum + item.quantity, 0);

  if (totalItemsCount === 0 && !isOpen) return null;

  const handleSendWhatsAppEnquiry = async () => {
    if (bucket.length === 0) return;

    setIsSending(true);

    const productIds = bucket.map(item => item.product.id);

    // 1. Log enquiry to Supabase / API endpoint
    try {
      await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_ids: productIds }),
      });
    } catch (err) {
      console.error('Enquiry log error:', err);
    }

    // 2. Build client-side WhatsApp message (NO password or lock status info in text)
    let message = `Hello ${BUSINESS_CONFIG.name}! I am submitting a wholesale catalogue enquiry for the following items:\n\n`;
    
    bucket.forEach((item, index) => {
      const priceText = item.product.price ? `₹${item.product.price}` : 'Rate on Enquiry';
      message += `${index + 1}. *${item.product.name}*\n   Qty: ${item.quantity} set(s) | ${priceText}\n\n`;
    });

    message += `Please confirm stock availability and best wholesale pricing for Surat dispatch. Thank you!`;

    // 3. Open wa.me link directly
    const whatsappUrl = `https://wa.me/${BUSINESS_CONFIG.whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    // 4. Trigger celebration confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    // 5. Reset bucket state
    onClearBucket();
    setIsSending(false);
    setIsOpen(false);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 5000);
  };

  return (
    <>
      {/* Floating Trigger Button in Bottom-Right Thumb Zone */}
      {!isOpen && totalItemsCount > 0 && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-brand-600 hover:bg-brand-700 text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl flex items-center gap-3 border-2 border-white/20 transition-all hover:scale-105 active:scale-95 animate-bounce-short"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-2 -right-2 bg-yellow-400 text-gray-950 font-extrabold text-[11px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-brand-600 shadow">
              {totalItemsCount}
            </span>
          </div>
          <span className="font-bold text-xs uppercase tracking-wider hidden sm:inline">
            View Enquiry List ({totalItemsCount})
          </span>
        </button>
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-700 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-500 animate-slide-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <div>
            <p className="font-bold text-xs">Enquiry Sent via WhatsApp!</p>
            <p className="text-[11px] text-emerald-100">Our team will respond shortly with rates.</p>
          </div>
        </div>
      )}

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-fade-in">
          <div className="w-full max-w-md bg-white h-full flex flex-col justify-between shadow-2xl border-l border-gray-100">
            
            {/* Header */}
            <div className="bg-brand-700 p-4 text-white flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-yellow-300" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base">Enquiry Bucket</h3>
                  <p className="text-[11px] text-white/80">{totalItemsCount} item(s) selected for enquiry</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bucket Item List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {bucket.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium">Your enquiry list is currently empty.</p>
                  <p className="text-xs mt-1">Browse catalogue and add dress materials.</p>
                </div>
              ) : (
                bucket.map(({ product, quantity }) => {
                  const image = (product.images && product.images[0]) || product.preview_image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80';
                  
                  return (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100"
                    >
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white shrink-0 border border-gray-200">
                        <Image src={image} alt={product.name} fill className="object-cover" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-xs text-gray-900 line-clamp-1">
                          {product.name}
                        </h4>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {product.price ? `₹${product.price}` : 'Rate on Enquiry'}
                        </p>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-1.5">
                          <button
                            onClick={() => onUpdateQuantity(product.id, Math.max(1, quantity - 1))}
                            className="w-5 h-5 bg-white border border-gray-300 rounded text-xs font-bold text-gray-700 hover:bg-gray-100 flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold text-gray-800">{quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                            className="w-5 h-5 bg-white border border-gray-300 rounded text-xs font-bold text-gray-700 hover:bg-gray-100 flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => onRemoveFromBucket(product.id)}
                        className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Action */}
            {bucket.length > 0 && (
              <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-600 font-medium">
                  <span>Selected Products:</span>
                  <span className="font-bold text-gray-900">{bucket.length} Designs ({totalItemsCount} Sets)</span>
                </div>

                <button
                  onClick={handleSendWhatsAppEnquiry}
                  disabled={isSending}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <WhatsAppIcon className="w-5 h-5 fill-white shrink-0" />
                  <span>Send Wholesale Enquiry on WhatsApp</span>
                </button>

                <button
                  onClick={onClearBucket}
                  className="w-full py-1.5 text-[11px] text-gray-400 hover:text-red-600 font-medium transition-colors text-center"
                >
                  Clear Entire Enquiry List
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
};
