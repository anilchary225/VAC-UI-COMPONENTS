import React from 'react';
import { Bookmark, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../features/auth/authStore';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';

export const FavoritesPage: React.FC = () => {
  const { user, openAuthModal } = useAuth();

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Sign in to view saved favorites
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 mb-6 max-w-sm mx-auto">
          Create an account or sign in to bookmark components and sync them across all your devices.
        </p>
        <Button onClick={() => openAuthModal('login')} variant="primary">
          Sign In to Account
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          My Favorites
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Your bookmarked components for fast reference and implementation.
        </p>
      </div>

      <div className="text-center py-16 rounded-panel border border-dashed border-[#E7E9F0] dark:border-white/10 p-8">
        <Bookmark className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">No favorites yet</h3>
        <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto mb-4">
          Browse the catalog and click the bookmark icon on any component to save it here.
        </p>
        <Link to="/components">
          <Button variant="secondary" size="sm" className="gap-1.5">
            Browse Components <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
};
