'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Product, PublicProduct } from '@/types';
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle, Loader2, X } from 'lucide-react';

interface PasswordUnlockModalProps {
  product: Product | PublicProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccessUnlock: (unlockedProduct: Product) => void;
}

export const PasswordUnlockModal: React.FC<PasswordUnlockModalProps> = ({
  product,
  isOpen,
  onClose,
  onSuccessUnlock,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMessage('Please enter the access password');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch(`/api/products/${product.id}/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || 'Incorrect password. Please try again.');
        setIsLoading(false);
        return;
      }

      if (data.product) {
        setPassword('');
        setIsLoading(false);
        onSuccessUnlock(data.product);
        onClose();
      }
    } catch (err) {
      setErrorMessage('Network error during verification. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-modal overflow-hidden border border-gray-100">
        
        {/* Modal Top Header Accent */}
        <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-amber-600 p-5 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl mx-auto flex items-center justify-center mb-2 shadow-inner">
            <Lock className="w-6 h-6 text-yellow-300" />
          </div>
          <h3 className="font-serif text-xl font-bold tracking-tight">Private Catalogue Design</h3>
          <p className="text-xs text-white/90 font-medium mt-1">
            Enter the password shared by Chetak Fashion to view details.
          </p>
        </div>

        {/* Product Teaser Preview */}
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3.5 bg-gray-50 p-3 rounded-2xl border border-gray-100">
            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-200 shrink-0 border border-gray-200">
              <Image
                src={product.preview_image || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80'}
                alt={product.name}
                fill
                className="object-cover blur-[2px]"
              />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Exclusive Item
              </span>
              <h4 className="font-semibold text-sm text-gray-900 line-clamp-1 mt-0.5">
                {product.name}
              </h4>
              <p className="text-xs text-gray-500">Prices and full high-res images are password protected.</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Enter Product Access Code / Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="e.g. chetak123"
                  className="w-full pl-3.5 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm font-medium outline-none transition-all"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Feedback */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" /> Unlock Product
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Help */}
          <p className="text-[11px] text-center text-gray-500 pt-2 border-t border-gray-100">
            Don't have the password?{' '}
            <a
              href={`https://wa.me/919724660535?text=${encodeURIComponent(`Hello Chetak Fashion! Please send me the password for locked item: ${product.name}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-700 font-semibold hover:underline"
            >
              Ask on WhatsApp
            </a>
          </p>
        </div>

      </div>
    </div>
  );
};
