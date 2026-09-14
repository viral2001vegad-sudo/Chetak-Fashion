'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Category } from '@/types';
import { BUSINESS_CONFIG } from '@/config/business';
import { ArrowLeft, Plus, Edit2, Trash2, Save, X, FolderTree, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCatName, setNewCatName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Edit State
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState('');

  // Delete Target
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  useEffect(() => {
    const token = localStorage.getItem('chetak_admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    fetchCategories();
  }, [router]);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Fetch categories error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameToAdd = newCatName.trim();
    if (!nameToAdd) return;

    // Optimistic UI addition (0ms delay)
    const tempCat: Category = {
      id: `cat-${Date.now()}`,
      name: nameToAdd,
      sort_order: categories.length + 1,
    };

    setCategories((prev) => [...prev, tempCat]);
    setNewCatName('');
    showToast('Category added successfully');
    setIsSaving(true);

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameToAdd, sort_order: categories.length + 1 }),
      });

      const data = await res.json();
      if (data.category) {
        // Replace temp category with server category if returned
        setCategories((prev) =>
          prev.map((c) => (c.id === tempCat.id ? data.category : c))
        );
      }
    } catch (err) {
      console.error('Category save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEdit = async (id: string) => {
    const nameToSave = editingCatName.trim();
    if (!nameToSave) return;

    // Optimistic UI update
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name: nameToSave } : c))
    );
    setEditingCatId(null);
    showToast('Category updated successfully');
    setIsSaving(true);

    try {
      await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: nameToSave }),
      });
    } catch (err) {
      console.error('Edit save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCat = async () => {
    if (!deleteTargetId) return;

    const targetId = deleteTargetId;
    setCategories((prev) => prev.filter((c) => c.id !== targetId));
    showToast('Category deleted successfully');
    setDeleteTargetId(null);

    try {
      await fetch(`/api/admin/categories?id=${targetId}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Delete category error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main text-text-primary pb-12">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-slide-in border border-gray-700">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="p-1.5 rounded-xl hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="font-serif font-bold text-lg text-gray-900 leading-none">
                Category Management
              </h1>
              <p className="text-[10px] text-gray-500 font-medium">
                Organize dress materials & suit catalogue sections
              </p>
            </div>
          </div>
          <FolderTree className="w-5 h-5 text-brand-600" />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        
        {/* Add Category Form */}
        <form onSubmit={handleAddCategory} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <label className="block text-xs font-bold text-gray-800">
            Add New Catalogue Category
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. Cotton Dress Materials, Silk Sarees..."
              className="flex-1 px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs outline-none focus:border-brand-500 font-medium"
            />
            <button
              type="submit"
              disabled={isSaving || !newCatName.trim()}
              className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow flex items-center gap-1.5 shrink-0 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span>Add Category</span>
            </button>
          </div>
        </form>

        {/* Category List */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Active Categories ({categories.length})
            </span>
            <span className="text-[11px] text-gray-400">Directly synchronized with Supabase</span>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-xs text-gray-400">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-400 space-y-1">
              <FolderTree className="w-8 h-8 mx-auto opacity-30" />
              <p className="font-semibold text-gray-700">No categories created yet.</p>
              <p className="text-[11px]">Use the form above to add your first category.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {categories.map((cat, idx) => (
                <div key={cat.id} className="py-3 flex items-center justify-between gap-3">
                  {editingCatId === cat.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editingCatName}
                        onChange={(e) => setEditingCatName(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-brand-500 rounded-xl text-xs outline-none font-semibold"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(cat.id)}
                        disabled={isSaving}
                        className="p-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow text-xs font-bold flex items-center gap-1"
                      >
                        <Save className="w-3.5 h-3.5" /> Save
                      </button>
                      <button
                        onClick={() => setEditingCatId(null)}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg text-xs"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-gray-400 w-5 text-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-gray-900">{cat.name}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingCatId(cat.id);
                            setEditingCatName(cat.name);
                          }}
                          className="p-2 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          title="Edit Category Name"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(cat.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* Delete Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-modal text-center">
            <Trash2 className="w-10 h-10 text-red-600 mx-auto" />
            <h3 className="font-serif font-bold text-lg text-gray-900">Delete Category?</h3>
            <p className="text-xs text-gray-500">
              Are you sure you want to remove this category? Products in this category will be unassigned.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="flex-1 py-2.5 text-xs font-semibold border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCat}
                className="flex-1 py-2.5 text-xs font-bold bg-red-600 text-white rounded-xl hover:bg-red-700 shadow"
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
