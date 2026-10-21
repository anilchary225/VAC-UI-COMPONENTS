import React from 'react';
import { FolderHeart, Plus, Lock } from 'lucide-react';
import { useAuth } from '../features/auth/authStore';

export const CollectionsPage: React.FC = () => {
  const { user, openAuthModal } = useAuth();

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 rounded-full bg-purple-500/10 text-[#5B4FF5] flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-[#161722] dark:text-white">
          Sign in to manage custom collections
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 mb-6 max-w-sm mx-auto">
          Group components into private project boards (e.g. "SaaS Platform", "E-Commerce", "Admin Portal").
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-5 py-2.5 rounded-full bg-[#181A25] hover:bg-black text-white text-xs font-semibold shadow-sm transition-all"
        >
          Sign In to Account
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#161722] dark:text-white">
            Custom Collections
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Organize UI components by project and workflow.
          </p>
        </div>
        <button className="px-4 py-2 rounded-full bg-[#181A25] hover:bg-black text-white text-xs font-medium flex items-center gap-1.5 shadow-sm transition-all">
          <Plus className="w-4 h-4" />
          New Collection
        </button>
      </div>

      <div className="text-center py-16 rounded-2xl border border-dashed border-[#E8EAEF] dark:border-white/10 p-8 bg-white dark:bg-[#11131A]">
        <FolderHeart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-[#161722] dark:text-white">No collections created</h3>
        <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
          Create collections to group components for your upcoming applications.
        </p>
      </div>
    </div>
  );
};
