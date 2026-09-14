'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product, Category } from '@/types';
import { BUSINESS_CONFIG } from '@/config/business';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '@/lib/mockData';
import {
  ShieldCheck,
  Plus,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  BarChart3,
  Search,
  Trash2,
  Edit3,
  Sparkles,
  LogOut,
  Save,
  X,
  AlertCircle,
  Upload,
  ImageIcon,
  Loader2,
  FolderTree
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Toast Notification
  const [toastMessage, setToastMessage] = useState('');

  // Product Add/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [formPassword, setFormPassword] = useState('');
  const [formConfirmPassword, setFormConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');

  // Quick Password Set Dialog for Lock Toggle
  const [quickLockProduct, setQuickLockProduct] = useState<Product | null>(null);
  const [quickPassword, setQuickPassword] = useState('');

  // Delete Confirmation Modal
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // File Upload State
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: 'main' | 'preview') => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.url) {
        if (targetField === 'main') {
          const currentImages = editingProduct.images || [];
          setEditingProduct({ ...editingProduct, images: [data.url, ...currentImages] });
        } else {
          setEditingProduct({ ...editingProduct, preview_image: data.url });
        }
        showToast('Image uploaded to Supabase Storage!');
      } else {
        showToast('Image upload failed');
      }
    } catch (err) {
      showToast('Error uploading file');
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    // Check auth
    const token = localStorage.getItem('chetak_admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    fetchProducts();
    fetchCategories();
  }, [router]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Fetch categories error:', err);
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
      } else {
        setProducts(MOCK_PRODUCTS);
      }
    } catch (err) {
      setProducts(MOCK_PRODUCTS);
    } finally {
      setIsLoading(false);
    }
  };

  // Instant Status Toggles
  const handleToggleHide = async (product: Product) => {
    const updatedHidden = !product.is_hidden;
    try {
      await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...product, is_hidden: updatedHidden }),
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_hidden: updatedHidden } : p))
      );
      showToast(updatedHidden ? `"${product.name}" is now HIDDEN from catalogue` : `"${product.name}" is now VISIBLE on catalogue`);
    } catch (err) {
      showToast('Error updating status');
    }
  };

  const handleToggleStock = async (product: Product) => {
    const updatedStock = !product.in_stock;
    try {
      await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...product, in_stock: updatedStock }),
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, in_stock: updatedStock } : p))
      );
      showToast(updatedStock ? `Marked "${product.name}" as IN STOCK` : `Marked "${product.name}" as OUT OF STOCK`);
    } catch (err) {
      showToast('Error updating stock status');
    }
  };

  const handleToggleLockQuick = async (product: Product) => {
    if (product.is_locked) {
      // Unlock item
      try {
        await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...product, is_locked: false, password: '' }),
        });
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, is_locked: false, password_hash: null } : p))
        );
        showToast(`Unlocked "${product.name}" - now public`);
      } catch (err) {
        showToast('Error unlocking item');
      }
    } else {
      // Prompt for password
      setQuickLockProduct(product);
      setQuickPassword('chetak123');
    }
  };

  const handleApplyQuickLock = async () => {
    if (!quickLockProduct || !quickPassword.trim()) return;

    try {
      await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...quickLockProduct,
          is_locked: true,
          password: quickPassword.trim(),
        }),
      });
      setProducts((prev) =>
        prev.map((p) =>
          p.id === quickLockProduct.id ? { ...p, is_locked: true } : p
        )
      );
      showToast(`Locked "${quickLockProduct.name}" with password`);
      setQuickLockProduct(null);
    } catch (err) {
      showToast('Error locking product');
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteTargetId) return;
    try {
      await fetch(`/api/admin/products?id=${deleteTargetId}`, { method: 'DELETE' });
      setProducts((prev) => prev.filter((p) => p.id !== deleteTargetId));
      showToast('Product deleted permanently');
      setDeleteTargetId(null);
    } catch (err) {
      showToast('Error deleting product');
    }
  };

  // Open Form Modal for Create or Edit
  const handleOpenAddModal = () => {
    setEditingProduct({
      name: '',
      category_id: categories[0]?.id || 'cat-1',
      price: undefined,
      price_visible: true,
      description: '',
      images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80'],
      in_stock: true,
      is_hidden: false,
      is_featured: false,
      is_locked: false,
      preview_image: '',
    });
    setFormPassword('');
    setFormConfirmPassword('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormPassword('');
    setFormConfirmPassword('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveProductForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name?.trim()) {
      setFormError('Product name is required');
      return;
    }

    if (editingProduct.is_locked) {
      if (!editingProduct.id && !formPassword) {
        setFormError('Please enter a password for this locked product');
        return;
      }
      if (formPassword && formPassword !== formConfirmPassword) {
        setFormError('Passwords do not match');
        return;
      }
    }

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingProduct,
          password: formPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.message || 'Save failed');
        return;
      }

      showToast(editingProduct.id ? 'Product updated successfully' : 'Product created successfully');
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      setFormError('Network error while saving product');
    }
  };

  // Stats calculation
  const totalProducts = products.length;
  const hiddenCount = products.filter((p) => p.is_hidden).length;
  const lockedCount = products.filter((p) => p.is_locked).length;
  const outOfStockCount = products.filter((p) => !p.in_stock).length;

  const filteredList = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-bg-main text-text-primary flex flex-col pb-20">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-slide-in border border-gray-700">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Top Header Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center p-1">
              <Image src={BUSINESS_CONFIG.logoPath} alt="" width={32} height={32} className="object-contain" />
            </div>
            <div>
              <h1 className="font-serif text-lg font-bold text-gray-900 leading-none">
                {BUSINESS_CONFIG.name} Admin Panel
              </h1>
              <span className="text-[10px] font-semibold text-brand-700">Mobile Wholesale Manager</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/categories"
              className="flex items-center gap-1.5 bg-brand-50 hover:bg-brand-100 text-brand-900 px-3 py-1.5 rounded-xl text-xs font-bold border border-brand-200 transition-colors"
            >
              <FolderTree className="w-3.5 h-3.5 text-brand-700" />
              <span className="hidden sm:inline">Categories</span>
            </Link>

            <Link
              href="/admin/insights"
              className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 px-3 py-1.5 rounded-xl text-xs font-bold border border-amber-200 transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Insights</span>
            </Link>

            <button
              onClick={() => {
                localStorage.removeItem('chetak_admin_token');
                router.push('/admin/login');
              }}
              className="text-gray-500 hover:text-red-600 p-2 rounded-xl hover:bg-gray-100"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Body */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6 w-full flex-1">
        
        {/* Summary Strip Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm space-y-1">
            <span className="text-[11px] font-medium text-gray-500">Total Products</span>
            <p className="text-xl font-bold text-gray-900">{totalProducts}</p>
          </div>

          <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-100 shadow-sm space-y-1">
            <span className="text-[11px] font-semibold text-amber-800 flex items-center gap-1">
              <Lock className="w-3 h-3 text-amber-600" /> Locked Items
            </span>
            <p className="text-xl font-bold text-amber-950">{lockedCount}</p>
          </div>

          <div className="bg-gray-100 p-3.5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
            <span className="text-[11px] font-semibold text-gray-600 flex items-center gap-1">
              <EyeOff className="w-3 h-3" /> Hidden Items
            </span>
            <p className="text-xl font-bold text-gray-800">{hiddenCount}</p>
          </div>

          <div className="bg-red-50/60 p-3.5 rounded-2xl border border-red-100 shadow-sm space-y-1">
            <span className="text-[11px] font-semibold text-red-800">Out of Stock</span>
            <p className="text-xl font-bold text-red-950">{outOfStockCount}</p>
          </div>
        </div>

        {/* Search & Actions Strip */}
        <div className="flex items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product inventory..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-brand-500"
            />
          </div>

          <button
            onClick={handleOpenAddModal}
            className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Product</span>
          </button>
        </div>

        {/* Product Cards Listing (Mobile-optimized cards, NOT cramped table) */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-12 text-gray-400">Loading admin products...</div>
          ) : filteredList.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl text-center text-gray-500 text-xs">
              No products found matching query.
            </div>
          ) : (
            filteredList.map((prod) => {
              const image = (prod.images && prod.images[0]) || prod.preview_image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80';
              
              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-start gap-3.5">
                    {/* Image */}
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                      <Image src={image} alt={prod.name} fill className="object-cover" />
                      {prod.is_locked && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Lock className="w-4 h-4 text-yellow-400" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {prod.category_name || 'Dress Material'}
                        </span>
                        {prod.is_featured && (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                            Featured
                          </span>
                        )}
                      </div>

                      <h3 className="font-semibold text-sm text-gray-900 line-clamp-1 mt-1">
                        {prod.name}
                      </h3>

                      <p className="text-xs font-bold text-brand-700 mt-0.5">
                        {prod.price ? `₹${prod.price.toLocaleString('en-IN')}` : 'Price Hidden/Enquiry'}
                      </p>
                    </div>

                    {/* Quick Edit/Delete */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(prod)}
                        className="p-2 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                        title="Edit Product"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(prod.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* QUICK STATUS TOGGLE BAR (Instant single-tap toggles) */}
                  <div className="pt-2.5 border-t border-gray-100 grid grid-cols-3 gap-2 text-center text-[11px] font-semibold">
                    
                    {/* Hide / Show Toggle */}
                    <button
                      onClick={() => handleToggleHide(prod)}
                      className={`py-1.5 px-2 rounded-xl border flex items-center justify-center gap-1 transition-all ${
                        prod.is_hidden
                          ? 'bg-gray-100 text-gray-600 border-gray-300'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {prod.is_hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{prod.is_hidden ? 'Hidden' : 'Visible'}</span>
                    </button>

                    {/* Stock Toggle */}
                    <button
                      onClick={() => handleToggleStock(prod)}
                      className={`py-1.5 px-2 rounded-xl border flex items-center justify-center gap-1 transition-all ${
                        prod.in_stock
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-red-50 text-red-800 border-red-200'
                      }`}
                    >
                      {prod.in_stock ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>{prod.in_stock ? 'In Stock' : 'Out Stock'}</span>
                    </button>

                    {/* Lock / Unlock Toggle */}
                    <button
                      onClick={() => handleToggleLockQuick(prod)}
                      className={`py-1.5 px-2 rounded-xl border flex items-center justify-center gap-1 transition-all ${
                        prod.is_locked
                          ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                          : 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}
                    >
                      {prod.is_locked ? <Lock className="w-3 h-3 text-amber-700" /> : <Unlock className="w-3 h-3" />}
                      <span>{prod.is_locked ? 'Locked' : 'Open'}</span>
                    </button>

                  </div>
                </div>
              );
            })
          )}
        </div>

      </main>

      {/* Floating Mobile Add Product Button in Thumb Zone */}
      <button
        onClick={handleOpenAddModal}
        className="fixed bottom-6 right-6 z-40 bg-brand-600 hover:bg-brand-700 text-white p-4 rounded-full shadow-2xl flex items-center justify-center border-2 border-white/20 hover:scale-105 active:scale-95 transition-all"
        title="Add New Product"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* QUICK LOCK PASSWORD PROMPT DIALOG */}
      {quickLockProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-modal">
            <h3 className="font-serif font-bold text-lg text-gray-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-600" /> Lock Product Access
            </h3>
            <p className="text-xs text-gray-600">
              Set a password for <span className="font-bold">{quickLockProduct.name}</span>. Only customers with this password can view prices & photos.
            </p>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Set Access Password</label>
              <input
                type="text"
                value={quickPassword}
                onChange={(e) => setQuickPassword(e.target.value)}
                placeholder="e.g. chetak123"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm font-semibold outline-none focus:border-brand-500"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setQuickLockProduct(null)}
                className="flex-1 py-2 text-xs font-semibold border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyQuickLock}
                className="flex-1 py-2 text-xs font-bold bg-amber-600 text-white rounded-xl hover:bg-amber-700 shadow"
              >
                Lock Item Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL ADD/EDIT PRODUCT MODAL */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-modal w-full max-w-lg overflow-hidden border border-gray-100 my-auto">
            
            <div className="bg-brand-700 p-4 text-white flex items-center justify-between">
              <h3 className="font-serif font-bold text-base">
                {editingProduct.id ? 'Edit Product Details' : 'Add New Dress Material'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProductForm} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  required
                  placeholder="e.g. Royal Chanderi Silk Dress Material"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:border-brand-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={editingProduct.category_id || 'cat-1'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs outline-none focus:border-brand-500 font-medium"
                  >
                    {categories.length > 0 ? (
                      categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))
                    ) : (
                      MOCK_CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Wholesale Price (₹)</label>
                  <input
                    type="number"
                    value={editingProduct.price || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || undefined })}
                    placeholder="e.g. 2450"
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:border-brand-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description & Fabric Notes</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  placeholder="Unstitched suit material, embroidery details, dupatta specifications..."
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs outline-none focus:border-brand-500 font-medium"
                />
              </div>

              {/* Image Upload to Supabase Storage */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700">
                  Product Image (Upload to Supabase Storage)
                </label>
                
                <div className="flex items-center gap-2">
                  <label className="flex-1 border-2 border-dashed border-gray-300 hover:border-brand-500 rounded-xl p-3 text-center cursor-pointer bg-gray-50 hover:bg-white transition-colors flex items-center justify-center gap-2">
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
                    ) : (
                      <Upload className="w-4 h-4 text-brand-600" />
                    )}
                    <span className="text-xs font-bold text-gray-700">
                      {isUploading ? 'Uploading to Supabase...' : 'Choose Image File from Phone/PC'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'main')}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="text-[11px] text-gray-400">Or paste external image URL:</div>
                <input
                  type="text"
                  value={(editingProduct.images && editingProduct.images[0]) || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, images: [e.target.value] })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs outline-none focus:border-brand-500 font-medium"
                />

                {/* Uploaded Thumbnail Preview */}
                {editingProduct.images && editingProduct.images.length > 0 && (
                  <div className="flex gap-2 mt-2 overflow-x-auto">
                    {editingProduct.images.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 shrink-0">
                        <Image src={img} alt="" fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = editingProduct.images?.filter((_, i) => i !== idx);
                            setEditingProduct({ ...editingProduct, images: updated });
                          }}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* LOCK CONTROLS SECTION */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-700" />
                    <span className="text-xs font-bold text-amber-950">Lock this product with password</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!editingProduct.is_locked}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_locked: e.target.checked })}
                    className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                  />
                </div>

                {editingProduct.is_locked && (
                  <div className="space-y-3 pt-2 border-t border-amber-200/60 animate-fade-in">
                    <div>
                      <label className="block text-xs font-semibold text-amber-900 mb-1">
                        Set Access Password (hashed with bcrypt)
                      </label>
                      <input
                        type="password"
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        placeholder={editingProduct.id ? "Leave blank to keep existing password" : "e.g. chetak123"}
                        className="w-full px-3 py-2 border border-amber-300 rounded-xl text-xs outline-none focus:border-amber-600"
                      />
                    </div>

                    {formPassword && (
                      <div>
                        <label className="block text-xs font-semibold text-amber-900 mb-1">Confirm Password</label>
                        <input
                          type="password"
                          value={formConfirmPassword}
                          onChange={(e) => setFormConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className="w-full px-3 py-2 border border-amber-300 rounded-xl text-xs outline-none focus:border-amber-600"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-amber-900 mb-1">
                        Teaser / Preview Image (Upload to Supabase Storage)
                      </label>
                      <div className="flex items-center gap-2 mb-1.5">
                        <label className="flex-1 border border-amber-300 bg-white hover:bg-amber-100/50 rounded-xl p-2 text-center cursor-pointer transition-colors flex items-center justify-center gap-2">
                          <Upload className="w-3.5 h-3.5 text-amber-700" />
                          <span className="text-xs font-semibold text-amber-900">
                            Upload Teaser Photo
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'preview')}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <input
                        type="text"
                        value={editingProduct.preview_image || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, preview_image: e.target.value })}
                        placeholder="Non-sensitive teaser photo URL"
                        className="w-full px-3 py-2 border border-amber-300 rounded-xl text-xs outline-none focus:border-amber-600"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* STATUS TOGGLES */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2 p-2.5 bg-gray-50 border rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!editingProduct.in_stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, in_stock: !e.target.checked })}
                    className="w-4 h-4 accent-red-600 rounded"
                  />
                  <span className="text-xs font-semibold text-gray-700">Mark Out of Stock</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 bg-gray-50 border rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!editingProduct.is_hidden}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_hidden: e.target.checked })}
                    className="w-4 h-4 accent-gray-700 rounded"
                  />
                  <span className="text-xs font-semibold text-gray-700">Hide from Catalogue</span>
                </label>
              </div>

              {formError && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* STICKY SAVE BAR */}
              <div className="pt-3 border-t border-gray-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 text-xs font-semibold border border-gray-200 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold bg-brand-600 text-white rounded-xl hover:bg-brand-700 shadow flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> Save Product
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-modal text-center">
            <Trash2 className="w-10 h-10 text-red-600 mx-auto" />
            <h3 className="font-serif font-bold text-lg text-gray-900">Delete Product Permanently?</h3>
            <p className="text-xs text-gray-500">
              This action cannot be undone. To temporarily hide a product instead, use the "Hide" toggle.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="flex-1 py-2.5 text-xs font-semibold border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                className="flex-1 py-2.5 text-xs font-bold bg-red-600 text-white rounded-xl hover:bg-red-700 shadow"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
