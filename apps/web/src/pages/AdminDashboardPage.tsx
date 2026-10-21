import React from 'react';
import { Shield, AlertTriangle, Layers, Users, PackageCheck, BarChart2 } from 'lucide-react';
import { useAuth } from '../features/auth/authStore';
import { Button } from '../components/ui/Button';

export const AdminDashboardPage: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const isAdmin = user?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
          <Shield className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Administrator Access Required
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 mb-6 leading-relaxed">
          The Component Studio and catalog release management are restricted to verified administrators.
          Sign in with an administrative account or provision initial credentials using the protected server bootstrap.
        </p>
        <Button onClick={() => openAuthModal('login')} variant="primary">
          Sign In as Admin
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-2">
          <Shield className="w-3 h-3" />
          Admin Studio Console
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Catalog & Release Management
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Review drafts, manage component versions, validate source schemas, and publish official catalog releases.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-panel border border-[#E7E9F0] dark:border-white/10 bg-white dark:bg-[#11131A]">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Published Components</span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">6</p>
        </div>

        <div className="p-5 rounded-panel border border-[#E7E9F0] dark:border-white/10 bg-white dark:bg-[#11131A]">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Pending Validation</span>
            <PackageCheck className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">0</p>
        </div>

        <div className="p-5 rounded-panel border border-[#E7E9F0] dark:border-white/10 bg-white dark:bg-[#11131A]">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Registered Developers</span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">24</p>
        </div>

        <div className="p-5 rounded-panel border border-[#E7E9F0] dark:border-white/10 bg-white dark:bg-[#11131A]">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Registry Status</span>
            <BarChart2 className="w-4 h-4 text-cyan-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-500 mt-2">Active</p>
        </div>
      </div>
    </div>
  );
};
