'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product, Category, Banner } from '@/types';
import { BusinessConfig } from '@/config/business';
import { useBusinessConfig } from '@/hooks/useBusinessConfig';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_BANNERS } from '@/lib/mockData';
import { getDeviceId } from '@/lib/device/deviceId';
import {
  ShieldCheck,
  Plus,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
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
  FolderTree,
  ExternalLink,
  Package,
  Settings,
  Menu,
  Phone,
  MapPin,
  MessageCircle,
  Check,
  Tag,
  ArrowRight,
  ChevronRight
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { config: businessConfig, updateConfig: updateBusinessConfig } = useBusinessConfig();

  // Tab State
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'banners' | 'security' | 'settings'>('products');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

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
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  // Category Add/Edit State
  const [newCatName, setNewCatName] = useState('');
  const [newCatImageUrl, setNewCatImageUrl] = useState('');
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState('');
  const [editingCatImageUrl, setEditingCatImageUrl] = useState('');
  const [isUploadingCatImage, setIsUploadingCatImage] = useState(false);

  // Banners Modal & State
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [newBannerTitle, setNewBannerTitle] = useState('Surat Direct Wholesale Manufacturer');
  const [newBannerSubtitle, setNewBannerSubtitle] = useState('Exclusive Dress Material & Suit Collections at Factory Rates');
  const [newBannerBadge, setNewBannerBadge] = useState('SURAT DIRECT WHOLESALE');
  const [newBannerImageUrl, setNewBannerImageUrl] = useState('');

  // Password Change State
  const [currentAdminPassword, setCurrentAdminPassword] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  // Authentication Guard State
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Dynamic Settings Form State
  const [settingsForm, setSettingsForm] = useState<BusinessConfig>(businessConfig);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    // Sync settings form with loaded business config
    setSettingsForm(businessConfig);
  }, [businessConfig]);

  useEffect(() => {
    // Check auth token & device authorization
    const checkAdminAuth = async () => {
      const token = localStorage.getItem('chetak_admin_token');
      if (!token) {
        setIsCheckingAuth(false);
        setIsAuthenticated(false);
        router.replace('/admin/login');
        return;
      }

      try {
        const deviceId = getDeviceId();
        const res = await fetch('/api/admin/device/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, deviceId }),
        });

        const data = await res.json();
        if (!res.ok || !data.authorized) {
          localStorage.removeItem('chetak_admin_token');
          setIsAuthenticated(false);
          setIsCheckingAuth(false);
          router.replace('/admin/login');
          return;
        }

        setIsAuthenticated(true);
        setIsCheckingAuth(false);

        fetchProducts();
        fetchCategories();
        fetchBanners();
      } catch (err) {
        localStorage.removeItem('chetak_admin_token');
        setIsAuthenticated(false);
        setIsCheckingAuth(false);
        router.replace('/admin/login');
      }
    };

    checkAdminAuth();
  }, [router]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleLogout = () => {
    localStorage.removeItem('chetak_admin_token');
    setIsAuthenticated(false);
    router.replace('/admin/login');
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
      if (Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        setProducts([]);
      }
    } catch (err) {
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBanners = async () => {
    try {
      const res = await fetch(`/api/banners?t=${Date.now()}`);
      const data = await res.json();
      if (Array.isArray(data.banners)) {
        setBanners(data.banners);
      } else {
        setBanners([]);
      }
    } catch (err) {
      setBanners([]);
    }
  };

  // --- Category Handlers ---
  const handleCatImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCatImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.url) {
        if (isEdit) {
          setEditingCatImageUrl(data.url);
        } else {
          setNewCatImageUrl(data.url);
        }
        showToast('Category cover photo uploaded!');
      } else {
        showToast('Image upload failed');
      }
    } catch (err) {
      showToast('Error uploading category image');
    } finally {
      setIsUploadingCatImage(false);
      e.target.value = '';
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameToAdd = newCatName.trim();
    if (!nameToAdd) return;

    setIsAddingCat(true);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameToAdd, image_url: newCatImageUrl.trim() || null }),
      });
      const data = await res.json();
      if (data.categories) {
        setCategories(data.categories);
      } else {
        await fetchCategories();
      }
      showToast(`Category "${nameToAdd}" created!`);
      setNewCatName('');
      setNewCatImageUrl('');
    } catch (err) {
      showToast('Error adding category');
    } finally {
      setIsAddingCat(false);
    }
  };

  const handleUpdateCategory = async (id: string) => {
    if (!editingCatName.trim()) return;
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: editingCatName.trim(), image_url: editingCatImageUrl.trim() || null }),
      });
      const data = await res.json();
      if (data.categories) {
        setCategories(data.categories);
      } else {
        await fetchCategories();
      }
      showToast('Category updated!');
      setEditingCatId(null);
      setEditingCatName('');
      setEditingCatImageUrl('');
    } catch (err) {
      showToast('Error updating category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.categories) {
        setCategories(data.categories);
      } else {
        await fetchCategories();
      }
      showToast('Category deleted!');
    } catch (err) {
      showToast('Error deleting category');
    }
  };

  // --- Banner Handlers ---
  const handleBannerFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingBanner(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.url) {
        setNewBannerImageUrl(data.url);
        showToast('Banner image uploaded successfully!');
      } else {
        showToast('Failed to upload banner image');
      }
    } catch (err) {
      showToast('Error uploading banner image');
    } finally {
      setIsUploadingBanner(false);
      e.target.value = '';
    }
  };

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBannerTitle.trim()) return;

    try {
      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newBannerTitle,
          subtitle: newBannerSubtitle,
          badge: newBannerBadge,
          image_url: newBannerImageUrl || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&auto=format&fit=crop&q=80',
        }),
      });

      const data = await res.json();
      if (data.banners) {
        setBanners(data.banners);
      }
      showToast('Banner slide created successfully!');
      setNewBannerTitle('Surat Direct Wholesale Manufacturer');
      setNewBannerSubtitle('Exclusive Dress Material & Suit Collections');
      setNewBannerBadge('SURAT DIRECT WHOLESALE');
      setNewBannerImageUrl('');
      setIsBannerModalOpen(false);
    } catch (err) {
      showToast('Failed to save banner slide');
    }
  };

  const handleDeleteBanner = async (id: string) => {
    try {
      const res = await fetch(`/api/banners?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.banners) {
        setBanners(data.banners);
      }
      showToast('Banner removed');
    } catch (err) {
      showToast('Failed to delete banner');
    }
  };

  // --- Password Change Handler ---
  const handleChangeAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError('');

    if (!currentAdminPassword.trim()) {
      setPasswordChangeError('Please enter your Current Admin Password.');
      return;
    }

    if (newAdminPassword !== confirmAdminPassword) {
      setPasswordChangeError('New passwords do not match.');
      return;
    }

    if (newAdminPassword.length < 6) {
      setPasswordChangeError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmittingPassword(true);
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: currentAdminPassword.trim(),
          newPassword: newAdminPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPasswordChangeError(data.error || 'Password update failed.');
        setIsSubmittingPassword(false);
        return;
      }

      showToast('Admin password updated successfully!');
      setCurrentAdminPassword('');
      setNewAdminPassword('');
      setConfirmAdminPassword('');
    } catch (err) {
      setPasswordChangeError('Server error while changing password.');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  // --- Product File Upload ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: 'main' | 'preview') => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !editingProduct) return;

    if (targetField === 'main') {
      const currentImages = editingProduct.images || [];
      if (currentImages.length >= 2) {
        showToast('Maximum 2 images allowed per product!');
        e.target.value = '';
        return;
      }
    }

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      const currentImages = editingProduct.images || [];
      const remainingSlots = targetField === 'main' ? 2 - currentImages.length : 1;
      const filesToUpload = files.slice(0, remainingSlots);

      for (const file of filesToUpload) {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (data.url) {
          uploadedUrls.push(data.url);
        }
      }

      if (uploadedUrls.length > 0) {
        if (targetField === 'main') {
          const combined = [...currentImages, ...uploadedUrls].slice(0, 2);
          setEditingProduct({ ...editingProduct, images: combined });
          showToast(`${uploadedUrls.length} image(s) uploaded! (Max 2 images limit)`);
        } else {
          setEditingProduct({ ...editingProduct, preview_image: uploadedUrls[0] });
          showToast('Teaser image uploaded!');
        }
      } else {
        showToast('Image upload failed');
      }
    } catch (err) {
      showToast('Error uploading files');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // --- Product Toggles ---
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
      showToast(updatedHidden ? `"${product.name}" is now HIDDEN` : `"${product.name}" is now VISIBLE`);
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
      showToast(updatedStock ? `Marked "${product.name}" IN STOCK` : `Marked "${product.name}" OUT OF STOCK`);
    } catch (err) {
      showToast('Error updating stock status');
    }
  };

  const handleToggleLockQuick = async (product: Product) => {
    if (product.is_locked) {
      try {
        await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...product, is_locked: false, password: '' }),
        });
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, is_locked: false, password_hash: null } : p))
        );
        showToast(`Unlocked "${product.name}"`);
      } catch (err) {
        showToast('Error unlocking item');
      }
    } else {
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
      const res = await fetch(`/api/admin/products?id=${deleteTargetId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
      } else {
        await fetchProducts();
      }
      showToast('Product deleted permanently');
      setDeleteTargetId(null);
    } catch (err) {
      showToast('Error deleting product');
    }
  };

  const handleOpenAddModal = () => {
    setEditingProduct({
      name: '',
      brand_name: '',
      volume: '',
      top_fabric: 'Cotton',
      dupatta_fabric: 'Cotton',
      bottom_fabric: 'Cotton',
      category_id: categories[0]?.id || 'cat-1',
      price: undefined,
      price_visible: true,
      description: '',
      images: [],
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

    setFormError('');

    try {
      const sanitizedImages = (editingProduct.images || []).filter(img => img && img.trim().length > 0).slice(0, 2);

      // Prepend fabric specs to description for seamless card & detail rendering
      let fullDesc = editingProduct.description?.trim() || '';
      const topF = editingProduct.top_fabric?.trim() || 'Cotton';
      const dupF = editingProduct.dupatta_fabric?.trim() || 'Cotton';
      const botF = editingProduct.bottom_fabric?.trim() || 'Cotton';

      if (!/top\s*:/i.test(fullDesc)) {
        const fabricHeader = `Top : ${topF} | Dupatta : ${dupF}\nBottom : ${botF}`;
        fullDesc = fullDesc ? `${fabricHeader}\n\n${fullDesc}` : fabricHeader;
      }

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingProduct,
          description: fullDesc,
          images: sanitizedImages,
          preview_image: sanitizedImages[0] || editingProduct.preview_image || '',
          password: formPassword || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.message || 'Error saving product. Please check details.');
        return;
      }

      if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        await fetchProducts();
      }

      showToast(editingProduct.id ? 'Product updated successfully!' : 'New product created!');
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err?.message || 'Error saving product');
    }
  };

  // --- Dynamic Settings Form Handler ---
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      updateBusinessConfig(settingsForm);
      showToast('Store details and settings updated live!');
    } catch (err) {
      showToast('Failed to save settings');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesQuery =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      selectedCategoryFilter === 'all' || p.category_id === selectedCategoryFilter;
    return matchesQuery && matchesCat;
  });

  const categoryMap = categories.reduce((acc, cat) => {
    acc[cat.id] = cat.name;
    return acc;
  }, {} as Record<string, string>);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center p-4">
        <div className="flex items-center gap-2.5 text-brand-700 font-bold text-sm bg-white p-6 rounded-3xl border border-gray-100 shadow-md">
          <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
          <span>Verifying Admin Access...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row text-gray-800">

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-gray-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-gray-700 animate-bounce-short">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Mobile Bar */}
      <div className="md:hidden bg-brand-700 text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white p-1 flex items-center justify-center overflow-hidden">
            <img src="/logo.svg" alt="Chetak" width={32} height={32} style={{ maxWidth: '32px', maxHeight: '32px' }} />
          </div>
          <span className="font-serif font-bold text-lg tracking-tight">CHETAK ADMIN</span>
        </div>
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2 bg-brand-800 hover:bg-brand-900 rounded-xl"
        >
          <Menu className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Left Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200 flex flex-col justify-between transition-transform duration-200 ease-in-out ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
      >
        {/* Brand Title */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white border border-brand-100 shadow-sm p-1.5 flex items-center justify-center shrink-0">
              <img
                src="/logo.svg"
                alt="Chetak Fashion"
                width={44}
                height={44}
                style={{ width: '100%', height: '100%', maxWidth: '44px', maxHeight: '44px', objectFit: 'contain' }}
              />
            </div>
            <div>
              <h2 className="font-serif text-lg font-black text-brand-700 leading-none">
                {businessConfig.name}
              </h2>
              <span className="inline-block bg-brand-50 text-brand-700 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 border border-brand-100">
                SURAT ADMIN HQ
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar Menu Tabs */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {/* Products Tab */}
          <button
            onClick={() => { setActiveTab('products'); setIsMobileSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'products'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
          >
            <div className="flex items-center gap-3">
              <Package className="w-4 h-4" />
              <span>Products Catalogue</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${activeTab === 'products' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
              {products.length}
            </span>
          </button>

          {/* Categories Tab */}
          <button
            onClick={() => { setActiveTab('categories'); setIsMobileSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'categories'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
          >
            <div className="flex items-center gap-3">
              <FolderTree className="w-4 h-4" />
              <span>Categories</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${activeTab === 'categories' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
              {categories.length}
            </span>
          </button>

          {/* Banners Tab */}
          <button
            onClick={() => { setActiveTab('banners'); setIsMobileSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'banners'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
          >
            <div className="flex items-center gap-3">
              <ImageIcon className="w-4 h-4" />
              <span>Banner Slides</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${activeTab === 'banners' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
              {banners.length}
            </span>
          </button>

          {/* Security / Passwords Tab */}
          <button
            onClick={() => { setActiveTab('security'); setIsMobileSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'security'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4" />
              <span>Password & Security</span>
            </div>
          </button>

          {/* Settings Tab */}
          <button
            onClick={() => { setActiveTab('settings'); setIsMobileSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'settings'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
          >
            <div className="flex items-center gap-3">
              <Settings className="w-4 h-4" />
              <span>Store Settings</span>
            </div>
          </button>
        </nav>

        {/* Sidebar Footer Actions */}
        <div className="p-4 border-t border-gray-100 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors border border-emerald-200"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-emerald-600" /> Public Storefront
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-emerald-600" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-red-600 hover:bg-red-50 text-xs font-bold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">

        {/* Top Action Header Bar */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 bg-white p-5 rounded-3xl border border-gray-200/80 shadow-sm">
          <div>
            <h1 className="text-2xl font-serif font-black text-gray-900 tracking-tight capitalize">
              {activeTab === 'products' && 'Product Catalogue Management'}
              {activeTab === 'categories' && 'Category Directory Management'}
              {activeTab === 'banners' && 'Promotional Banner Slider Management'}
              {activeTab === 'security' && 'Admin Security & Access Passwords'}
              {activeTab === 'settings' && 'Live Business Details & Store Settings'}
            </h1>
            <p className="text-xs text-gray-500 font-medium mt-1">
              {activeTab === 'products' && 'Add, lock, or update wholesale suit materials & stock visibility.'}
              {activeTab === 'categories' && 'Organize catalogue categories for public store navigation.'}
              {activeTab === 'banners' && 'Upload and schedule promotional banner images.'}
              {activeTab === 'security' && 'Update master admin password and default security locks.'}
              {activeTab === 'settings' && 'Manage phone numbers, WhatsApp, shop address, and GSTIN dynamically.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {activeTab === 'products' && (
              <button
                onClick={handleOpenAddModal}
                className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" /> Add New Product
              </button>
            )}

            {activeTab === 'banners' && (
              <button
                onClick={() => setIsBannerModalOpen(true)}
                className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" /> Add Banner Slide
              </button>
            )}
          </div>
        </header>

        {/* --- TAB 1: PRODUCTS --- */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm">
                <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider block">Total Items</span>
                <span className="text-2xl font-bold text-gray-900 mt-1 block">{products.length}</span>
              </div>
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200/80 shadow-sm">
                <span className="text-[11px] text-amber-800 font-bold uppercase tracking-wider block flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-600" /> Locked Access
                </span>
                <span className="text-2xl font-bold text-amber-900 mt-1 block">
                  {products.filter(p => p.is_locked).length}
                </span>
              </div>
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200/80 shadow-sm">
                <span className="text-[11px] text-blue-800 font-bold uppercase tracking-wider block flex items-center gap-1">
                  <EyeOff className="w-3 h-3 text-blue-600" /> Hidden Items
                </span>
                <span className="text-2xl font-bold text-blue-900 mt-1 block">
                  {products.filter(p => p.is_hidden).length}
                </span>
              </div>
              <div className="bg-red-50 p-4 rounded-2xl border border-red-200/80 shadow-sm">
                <span className="text-[11px] text-red-800 font-bold uppercase tracking-wider block flex items-center gap-1">
                  <XCircle className="w-3 h-3 text-red-600" /> Out of Stock
                </span>
                <span className="text-2xl font-bold text-red-900 mt-1 block">
                  {products.filter(p => !p.in_stock).length}
                </span>
              </div>
            </div>

            {/* Search & Category Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products by name or description..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none"
              >
                <option value="all">All Categories ({products.length})</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Products List / Cards */}
            {isLoading ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-gray-200/80">
                <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto" />
                <p className="text-xs text-gray-500 font-semibold mt-2">Loading catalogue items...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-gray-200/80">
                <Package className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-sm font-bold text-gray-700 mt-2">No products found</p>
                <p className="text-xs text-gray-500 mt-1">Try adjusting search or category filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`bg-white rounded-3xl border overflow-hidden transition-all shadow-sm hover:shadow-md flex flex-col justify-between ${product.is_hidden ? 'border-gray-200 opacity-60' : 'border-gray-200/80'
                      }`}
                  >
                    <div>
                      {/* Product Image & Badges */}
                      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                        <img
                          src={product.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800'}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          <span className="bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {(product.category_id && categoryMap[product.category_id]) || 'General'}
                          </span>
                          {product.is_locked && (
                            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Password Protected
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-sm text-gray-900 line-clamp-1">{product.name}</h3>
                          <span className="text-sm font-extrabold text-brand-700 shrink-0">
                            {product.price ? `₹${product.price}` : 'Enquire'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
                      </div>
                    </div>

                    {/* Quick Toggles & Action Bar */}
                    <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        {/* Visibility Toggle */}
                        <button
                          onClick={() => handleToggleHide(product)}
                          title={product.is_hidden ? 'Make Visible' : 'Hide from Public'}
                          className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${product.is_hidden
                              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            }`}
                        >
                          {product.is_hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-emerald-600" />}
                        </button>

                        {/* In Stock Toggle */}
                        <button
                          onClick={() => handleToggleStock(product)}
                          title={product.in_stock ? 'Mark Out of Stock' : 'Mark In Stock'}
                          className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${product.in_stock
                              ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                        >
                          {product.in_stock ? <CheckCircle className="w-3.5 h-3.5 text-blue-600" /> : <XCircle className="w-3.5 h-3.5 text-red-600" />}
                        </button>

                        {/* Lock Toggle */}
                        <button
                          onClick={() => handleToggleLockQuick(product)}
                          title={product.is_locked ? 'Remove Password Lock' : 'Add Password Protection'}
                          className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${product.is_locked
                              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                          {product.is_locked ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(product)}
                          className="p-2 bg-white hover:bg-gray-100 text-gray-700 rounded-xl border border-gray-200"
                          title="Edit Product"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(product.id)}
                          className="p-2 bg-white hover:bg-red-50 text-red-600 rounded-xl border border-gray-200"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- TAB 2: CATEGORIES --- */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            {/* Add Category Form */}
            <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900">Create New Catalogue Category</h3>
              <form onSubmit={handleAddCategory} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Category Name (e.g. Silk Cotton Suits, Printed Kurtis...)"
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                    required
                  />
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-[#701A24] border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0">
                      {isUploadingCatImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      <span>Upload Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleCatImageUpload(e, false)}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={isAddingCat}
                      className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      {isAddingCat ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      Add Category
                    </button>
                  </div>
                </div>

                {newCatImageUrl && (
                  <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl border border-gray-200 w-fit">
                    <img src={newCatImageUrl} alt="Category preview" className="w-10 h-10 object-cover rounded-lg" />
                    <span className="text-[11px] text-gray-600 truncate max-w-[200px]">{newCatImageUrl}</span>
                    <button
                      type="button"
                      onClick={() => setNewCatImageUrl('')}
                      className="p-1 hover:bg-gray-200 rounded-lg text-gray-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Category Directory List */}
            <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-600 grid grid-cols-12 gap-4 items-center">
                <span className="col-span-2">Thumbnail</span>
                <span className="col-span-4">Category Name</span>
                <span className="col-span-3 text-center">Items Count</span>
                <span className="col-span-3 text-right">Actions</span>
              </div>

              <div className="divide-y divide-gray-100">
                {categories.map((cat) => {
                  const count = products.filter((p) => p.category_id === cat.id).length;
                  const isEditing = editingCatId === cat.id;
                  const catProd = products.find((p) => p.category_id === cat.id || (p.category_name && p.category_name.toLowerCase().includes(cat.name.toLowerCase())));
                  const displayImage = cat.image_url || (catProd?.images && catProd.images[0]) || catProd?.preview_image || (products[0]?.images && products[0].images[0]) || '/logo.svg';

                  return (
                    <div key={cat.id} className="p-4 grid grid-cols-12 gap-4 items-center text-xs font-semibold">
                      <div className="col-span-2">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                          <img src={displayImage} alt={cat.name} className="w-full h-full object-cover" />
                        </div>
                      </div>

                      <div className="col-span-4 flex items-center gap-2">
                        {isEditing ? (
                          <div className="flex flex-col gap-2 w-full">
                            <input
                              type="text"
                              value={editingCatName}
                              onChange={(e) => setEditingCatName(e.target.value)}
                              className="px-3 py-1.5 bg-white border border-brand-500 rounded-lg text-xs font-medium outline-none w-full"
                              placeholder="Category name"
                            />
                            <div className="flex items-center gap-2">
                              <label className="cursor-pointer px-2.5 py-1 bg-rose-50 text-[#701A24] border border-rose-200 rounded-lg text-[11px] font-bold flex items-center gap-1">
                                {isUploadingCatImage ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                                <span>Change Image</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleCatImageUpload(e, true)}
                                  className="hidden"
                                />
                              </label>
                              {editingCatImageUrl && (
                                <button
                                  type="button"
                                  onClick={() => setEditingCatImageUrl('')}
                                  className="text-[11px] text-red-600 underline font-medium"
                                >
                                  Remove Image
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <span className="text-gray-900 font-bold">{cat.name}</span>
                            {cat.image_url && <span className="text-[10px] text-emerald-600 font-medium">Custom Cover Image</span>}
                          </div>
                        )}
                      </div>

                      <div className="col-span-3 text-center">
                        <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-[11px] font-bold">
                          {count} Products
                        </span>
                      </div>

                      <div className="col-span-3 text-right flex items-center justify-end gap-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleUpdateCategory(cat.id)}
                              className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg hover:bg-emerald-200"
                              title="Save Category"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => { setEditingCatId(null); setEditingCatName(''); setEditingCatImageUrl(''); }}
                              className="p-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingCatId(cat.id);
                                setEditingCatName(cat.name);
                                setEditingCatImageUrl(cat.image_url || '');
                              }}
                              className="p-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                              title="Edit Category"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="p-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                              title="Delete Category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 3: BANNERS --- */}
        {activeTab === 'banners' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {banners.map((banner) => (
                <div key={banner.id} className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="relative aspect-[21/9] bg-gray-900 overflow-hidden">
                      <img src={banner.image_url || ''} alt={banner.title} className="w-full h-full object-cover opacity-80" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end">
                        <span className="bg-brand-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md w-max mb-1">
                          {banner.badge}
                        </span>
                        <h4 className="font-serif font-bold text-white text-base leading-tight">{banner.title}</h4>
                        <p className="text-[11px] text-gray-300 line-clamp-1">{banner.subtitle}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] text-emerald-700 font-bold bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Active Slide
                    </span>
                    <button
                      onClick={() => handleDeleteBanner(banner.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Slide
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 4: PASSWORD & SECURITY --- */}
        {activeTab === 'security' && (
          <div className="max-w-2xl bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-900">Admin Master Password & Auth Security</h3>
                <p className="text-xs text-gray-500">Update admin password securely using your Current Admin Password.</p>
              </div>
            </div>

            <form onSubmit={handleChangeAdminPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Current Admin Password *</label>
                <input
                  type="password"
                  value={currentAdminPassword}
                  onChange={(e) => setCurrentAdminPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">New Admin Password *</label>
                <input
                  type="password"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  value={confirmAdminPassword}
                  onChange={(e) => setConfirmAdminPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                  required
                />
              </div>

              {passwordChangeError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{passwordChangeError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingPassword}
                className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                {isSubmittingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Update Admin Password
              </button>
            </form>
          </div>
        )}

        {/* --- TAB 5: SETTINGS (Dynamic Business Details) --- */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center shrink-0">
                <Settings className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-900">Manage Live Store Details</h3>
                <p className="text-xs text-gray-500">Changes here dynamically reflect on Header, Footer, WhatsApp & Enquiries immediately.</p>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Store / Business Name</label>
                  <input
                    type="text"
                    value={settingsForm.name}
                    onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Contact Person Name</label>
                  <input
                    type="text"
                    value={settingsForm.contactPerson}
                    onChange={(e) => setSettingsForm({ ...settingsForm, contactPerson: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-brand-600" /> Primary Phone Number
                  </label>
                  <input
                    type="text"
                    value={settingsForm.phone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                    placeholder="+91 9724660535"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Number (Digit format e.g. 919724660535)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.whatsapp}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                    placeholder="919724660535"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-600" /> Shop / Market Address
                </label>
                <textarea
                  rows={3}
                  value={settingsForm.address}
                  onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={settingsForm.gstin}
                    onChange={(e) => setSettingsForm({ ...settingsForm, gstin: e.target.value })}
                    placeholder="24FLAPS3668L1ZK"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Store Tagline</label>
                  <input
                    type="text"
                    value={settingsForm.tagline}
                    onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Instagram Link</label>
                  <input
                    type="url"
                    value={settingsForm.instagram}
                    onChange={(e) => setSettingsForm({ ...settingsForm, instagram: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Google Maps URL</label>
                  <input
                    type="url"
                    value={settingsForm.googleMapsUrl}
                    onChange={(e) => setSettingsForm({ ...settingsForm, googleMapsUrl: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] text-gray-500 font-medium">Auto-synced to public website headers & footers.</span>
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
                >
                  {isSavingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Store Details
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* --- MODAL: Add / Edit Product --- */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto my-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="font-serif font-bold text-xl text-gray-900">
                {editingProduct.id ? 'Edit Product Item' : 'Add New Dress Material'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProductForm} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Product Title / Design Name *</label>
                  <input
                    type="text"
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    placeholder="e.g. Gurbat Vol-06 Cotton Suit Set"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Brand Tag (Card Badge)</label>
                  <input
                    type="text"
                    value={editingProduct.brand_name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand_name: e.target.value })}
                    placeholder="e.g. GURBAT, FIZA, SAHIBA, CHERRY"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={editingProduct.category_id || categories[0]?.id || 'cat-1'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category_id: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Volume / Catalog Tag</label>
                  <input
                    type="text"
                    value={editingProduct.volume || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, volume: e.target.value })}
                    placeholder="e.g. Vol 07 or Vol-1"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Wholesale Price (₹)</label>
                  <input
                    type="number"
                    value={editingProduct.price || ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        price: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="e.g. 535"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>

              {/* Fabric Specs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Top Fabric</label>
                  <input
                    type="text"
                    value={editingProduct.top_fabric || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, top_fabric: e.target.value })}
                    placeholder="e.g. Cotton / Rayon"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Dupatta Fabric</label>
                  <input
                    type="text"
                    value={editingProduct.dupatta_fabric || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, dupatta_fabric: e.target.value })}
                    placeholder="e.g. Cotton / Nazneen"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Bottom Fabric</label>
                  <input
                    type="text"
                    value={editingProduct.bottom_fabric || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, bottom_fabric: e.target.value })}
                    placeholder="e.g. Cotton"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Additional Design & Cut Details</label>
                <textarea
                  rows={2}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  placeholder="Additional work details, cut length, embroidery specs..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              {/* Images Upload */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700">Product Images (Maximum 2 Images)</label>
                  <span className={`text-[11px] font-bold ${(editingProduct.images || []).length >= 2 ? 'text-amber-600' : 'text-gray-500'}`}>
                    {(editingProduct.images || []).length}/2 Images
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {(editingProduct.images || []).length < 2 ? (
                    <label className="cursor-pointer bg-brand-50 hover:bg-brand-100 text-brand-700 px-4 py-2.5 rounded-xl border border-brand-200 text-xs font-bold flex items-center gap-2 transition-all">
                      {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      Upload Image Files (Max 2)
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleFileUpload(e, 'main')}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl">
                      ⚠️ Limit reached: Maximum 2 images per product. Remove an image to upload another.
                    </div>
                  )}
                </div>

                {editingProduct.images && editingProduct.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {editingProduct.images.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 group">
                        <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = editingProduct.images?.filter((_, i) => i !== idx);
                            setEditingProduct({ ...editingProduct, images: updated });
                          }}
                          className="absolute top-1 right-1 bg-red-600 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Password Lock Section */}
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_locked || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_locked: e.target.checked })}
                    className="w-4 h-4 text-brand-600 rounded"
                  />
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-amber-600" /> Password Lock Protection (Boutique Suits)
                  </span>
                </label>

                {editingProduct.is_locked && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-bold text-amber-900 mb-1">Set Access Password</label>
                      <input
                        type="password"
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        placeholder="e.g. chetak123"
                        className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-amber-900 mb-1">Confirm Password</label>
                      <input
                        type="password"
                        value={formConfirmPassword}
                        onChange={(e) => setFormConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                        className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: Add Banner Slide --- */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-gray-900">Add New Banner Slide</h3>
              <button onClick={() => setIsBannerModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBanner} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Badge Tag</label>
                <input
                  type="text"
                  value={newBannerBadge}
                  onChange={(e) => setNewBannerBadge(e.target.value)}
                  placeholder="NEW LAUNCH 2026"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Banner Main Title</label>
                <input
                  type="text"
                  value={newBannerTitle}
                  onChange={(e) => setNewBannerTitle(e.target.value)}
                  placeholder="Surat Direct Wholesale Manufacturer"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={newBannerSubtitle}
                  onChange={(e) => setNewBannerSubtitle(e.target.value)}
                  placeholder="Exclusive Suit Material Collections at Factory Rates"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Banner Image</label>
                <label className="cursor-pointer bg-brand-50 hover:bg-brand-100 text-brand-700 px-4 py-2.5 rounded-xl border border-brand-200 text-xs font-bold flex items-center justify-center gap-2">
                  {isUploadingBanner ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Choose Image File
                  <input type="file" accept="image/*" onChange={handleBannerFileUpload} className="hidden" />
                </label>
                {newBannerImageUrl && (
                  <img src={newBannerImageUrl} alt="Preview" className="w-full h-24 object-cover rounded-xl mt-2 border" />
                )}
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Create Banner Slide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: Quick Lock Dialog --- */}
      {quickLockProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600" /> Lock "{quickLockProduct.name}"
            </h3>
            <p className="text-xs text-gray-500">Enter a password required for boutique buyers to view this design.</p>
            <input
              type="password"
              value={quickPassword}
              onChange={(e) => setQuickPassword(e.target.value)}
              placeholder="Enter access password"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setQuickLockProduct(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyQuickLock}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md"
              >
                Apply Lock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: Delete Confirmation --- */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-sm text-red-600 flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Delete Product Permanently?
            </h3>
            <p className="text-xs text-gray-500">This action cannot be undone. Are you sure you want to remove this item?</p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md"
              >
                Delete Item
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
