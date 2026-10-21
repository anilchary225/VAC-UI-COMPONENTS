import React from 'react';
import { FolderHeart, Plus, Lock } from 'lucide-react';
import { useAuth } from '../features/auth/authStore';
import { Button } from '../components/ui/Button';

export const CollectionsPage: React.FC = () => {
  const { user, openAuthModal } = useAuth();

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Sign in to manage custom collections
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 mb-6 max-w-sm mx-auto">
          Group components into private project boards (e.g. "E-Commerce", "SaaS Dashboard").
        </p>
        <Button onClick={() => openAuthModal('login')} variant="primary">
          Sign In to Account
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Custom Collections
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Organize UI components by project and workflow.
          </p>
        </div>
        <Button size="sm" variant="primary" className="gap-1.5">
          <Plus className="w-4 h-4" />
          New Collection
        </Button>
      </div>

      <div className="text-center py-16 rounded-panel border border-dashed border-[#E7E9F0] dark:border-white/10 p-8">
        <FolderHeart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">No collections created</h3>
        <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
          Create collections to group components for your upcoming applications.
        </p>
      </div>
    </div>
  );
};
