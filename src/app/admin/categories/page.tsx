'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Category } from '@/types';
import { MOCK_CATEGORIES } from '@/lib/mockData';
import { ArrowLeft, Plus, Edit2, Trash2, Save, X, FolderTree } from 'lucide-react';

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('chetak_admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch(() => {});
  }, [router]);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      sort_order: categories.length + 1,
    };

    setCategories([...categories, newCategory]);
    setNewCatName('');
  };

  const handleSaveEdit = (id: string) => {
    if (!editingCatName.trim()) return;
    setCategories(categories.map(c => c.id === id ? { ...c, name: editingCatName.trim() } : c));
    setEditingCatId(null);
  };

  const handleDeleteCat = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  return (
    <div className="min-h-screen bg-bg-main text-text-primary pb-12">
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="p-1.5 rounded-xl hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="font-serif font-bold text-lg text-gray-900">Manage Categories</h1>
              <p className="text-[10px] text-gray-500">Add, rename, or reorder catalogue sections</p>
            </div>
          </div>
          <FolderTree className="w-5 h-5 text-brand-600" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        
        {/* Add Category Form */}
        <form onSubmit={handleAddCategory} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex gap-2">
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="New Category Name (e.g. Silk Dupattas)"
            className="flex-1 px-3.5 py-2 border border-gray-300 rounded-xl text-xs outline-none focus:border-brand-500 font-medium"
          />
          <button
            type="submit"
            className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow flex items-center gap-1 shrink-0"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </form>

        {/* Category List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
          {categories.map((cat, idx) => (
            <div key={cat.id} className="p-3.5 flex items-center justify-between gap-3">
              {editingCatId === cat.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={editingCatName}
                    onChange={(e) => setEditingCatName(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-brand-500 rounded-lg text-xs outline-none font-semibold"
                    autoFocus
                  />
                  <button onClick={() => handleSaveEdit(cat.id)} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded">
                    <Save className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditingCatId(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-gray-400 w-4">{idx + 1}</span>
                    <span className="text-xs font-bold text-gray-900">{cat.name}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingCatId(cat.id);
                        setEditingCatName(cat.name);
                      }}
                      className="p-1.5 text-gray-400 hover:text-brand-600 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCat(cat.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
