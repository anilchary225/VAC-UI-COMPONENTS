import React from 'react';
import { Bookmark, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../features/auth/authStore';
import { Link } from 'react-router-dom';

export const FavoritesPage: React.FC = () => {
  const { user, openAuthModal } = useAuth();

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 rounded-full bg-purple-500/10 text-[#5B4FF5] flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-[#161722] dark:text-white">
          Sign in to view saved favorites
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 mb-6 max-w-sm mx-auto">
          Create an account or sign in to bookmark components and sync them across your projects.
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#161722] dark:text-white">
          My Favorites
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Your bookmarked components for fast reference and implementation.
        </p>
      </div>

      <div className="text-center py-16 rounded-2xl border border-dashed border-[#E8EAEF] dark:border-white/10 p-8 bg-white dark:bg-[#11131A]">
        <Bookmark className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-[#161722] dark:text-white">No favorites yet</h3>
        <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto mb-4">
          Browse the catalog and click the bookmark icon on any component to save it here.
        </p>
        <Link to="/components">
          <button className="px-4 py-2 rounded-full border border-gray-200 dark:border-white/10 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 inline-flex items-center gap-1.5 transition-all">
            Browse Components <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </Link>
      </div>
    </div>
  );
};
