import React, { useState, useEffect } from 'react';
import { Folder, Plus, Layers, Check } from 'lucide-react';
import { api } from '../../lib/api';
import { CATEGORY_OPTIONS } from './ComponentStudio';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<string[]>(CATEGORY_OPTIONS);
  const [newCatName, setNewCatName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleAddCategory = () => {
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    if (categories.includes(trimmed)) {
      alert('This category already exists.');
      return;
    }
    setCategories([...categories, trimmed]);
    setNewCatName('');
    setShowAddForm(false);
    setMessage(`Category "${trimmed}" added successfully.`);
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#161722] dark:text-white flex items-center gap-2">
            <Folder className="w-4 h-4 text-[#5B4FF5]" />
            Category Matrix Management
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            System categories power the catalog matrix, CLI filtering, and component registry classification.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="self-start sm:self-auto px-4 py-2 rounded-2xl bg-[#5B4FF5] hover:bg-[#4F46E5] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Category</span>
        </button>
      </div>

      {message && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      {showAddForm && (
        <div className="p-5 rounded-3xl bg-white dark:bg-[#11131A] border border-[#5B4FF5]/30 space-y-3">
          <h4 className="text-xs font-bold text-[#161722] dark:text-white">Add System Category</h4>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. Media & Audio Players"
              className="text-xs p-2.5 rounded-xl bg-gray-50 dark:bg-black/30 border border-[#E8EAEF] dark:border-white/10 text-[#161722] dark:text-white flex-1 focus:outline-none"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddCategory}
                className="px-4 py-2.5 rounded-xl bg-[#5B4FF5] text-white text-xs font-semibold flex-1 sm:flex-none cursor-pointer"
              >
                Add Category
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 text-xs flex-1 sm:flex-none cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat, idx) => (
          <div
            key={cat}
            className="p-5 rounded-3xl bg-white dark:bg-[#11131A] border border-[#E8EAEF] dark:border-white/10 shadow-xs flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-purple-500/10 text-[#5B4FF5] flex items-center justify-center font-bold text-xs border border-purple-500/20">
                0{idx + 1}
              </div>
              <div>
                <h4 className="font-semibold text-xs text-[#161722] dark:text-white">{cat}</h4>
                <span className="text-[10px] text-gray-400">System Taxonomy</span>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Active
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
