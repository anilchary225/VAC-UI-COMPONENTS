import React, { useState, useEffect } from 'react';
import {
  Shield,
  Layers,
  Sparkles,
  Plus,
  BarChart2,
  Folder,
  History,
  LayoutDashboard,
  Check,
  Copy,
  Terminal,
} from 'lucide-react';
import { useAuth } from '../features/auth/authStore';
import { api } from '../lib/api';
import { AdminOverview } from '../features/admin/AdminOverview';
import { AdminComponentsTable } from '../features/admin/AdminComponentsTable';
import { ComponentStudio } from '../features/admin/ComponentStudio';
import { AdminAuditLogs } from '../features/admin/AdminAuditLogs';
import { AdminAnalytics } from '../features/admin/AdminAnalytics';
import { AdminCategories } from '../features/admin/AdminCategories';

export const AdminDashboardPage: React.FC = () => {
  const { user, login, openAuthModal } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [activeTab, setActiveTab] = useState<'overview' | 'components' | 'studio' | 'categories' | 'audit' | 'analytics'>('overview');
  const [selectedStudioComponentId, setSelectedStudioComponentId] = useState<string | null>(null);

  const [overviewData, setOverviewData] = useState<{
    totalComponents: number;
    publishedCount: number;
    draftCount: number;
    deprecatedCount: number;
    validationIssuesCount: number;
    recentComponents: any[];
    recentAuditLogs: any[];
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const loadOverview = async () => {
    if (!isAdmin) return;
    setIsLoading(true);
    try {
      const data = await api.getAdminOverview();
      setOverviewData(data);
    } catch (err) {
      console.error('Failed to load admin overview:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadOverview();
    }
  }, [isAdmin, activeTab]);

  const handleDemoAdminSignIn = async () => {
    try {
      await login('admin@vac.dev', 'AdminPass123!');
    } catch {
      openAuthModal('login');
    }
  };

  const handleOpenStudio = (slugOrId: string) => {
    setSelectedStudioComponentId(slugOrId);
    setActiveTab('studio');
  };

  const handleCreateNew = () => {
    setSelectedStudioComponentId(null);
    setActiveTab('studio');
  };

  // If not admin, render clean security barrier
  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-14 h-14 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-2 border border-amber-500/20 shadow-lg">
          <Shield className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-[#161722] dark:text-white">
          Administrator Access Required
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 mb-6 leading-relaxed max-w-md mx-auto">
          The Component Studio and catalog release management are strictly restricted to verified administrative users.
          Sign in with an administrative account or authenticate using the pre-configured admin profile.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleDemoAdminSignIn}
            className="px-6 py-2.5 rounded-full bg-[#5B4FF5] hover:bg-[#4F46E5] text-white text-xs font-semibold shadow-md transition-all flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sign In as Demo Admin</span>
          </button>
          <button
            onClick={() => openAuthModal('login')}
            className="px-6 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 text-gray-800 dark:text-white text-xs font-semibold transition-all"
          >
            Custom Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-purple-500/10 text-[#5B4FF5] border border-purple-500/20 mb-2 font-semibold">
            <Shield className="w-3 h-3" />
            Admin Studio Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#161722] dark:text-white">
            Catalog & Release Management
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Author component drafts, manage source schemas, run server validation, and publish immutable releases to the catalog.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 rounded-2xl bg-[#5B4FF5] hover:bg-[#4F46E5] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Component</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-[#E8EAEF] dark:border-white/10 pb-2 text-xs font-medium overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-2xl transition-all flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-[#5B4FF5] text-white shadow-xs font-semibold'
              : 'text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('components')}
          className={`px-4 py-2 rounded-2xl transition-all flex items-center gap-2 ${
            activeTab === 'components'
              ? 'bg-[#5B4FF5] text-white shadow-xs font-semibold'
              : 'text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Components Management</span>
        </button>

        <button
          onClick={() => setActiveTab('studio')}
          className={`px-4 py-2 rounded-2xl transition-all flex items-center gap-2 ${
            activeTab === 'studio'
              ? 'bg-[#5B4FF5] text-white shadow-xs font-semibold'
              : 'text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Component Studio</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-2xl transition-all flex items-center gap-2 ${
            activeTab === 'categories'
              ? 'bg-[#5B4FF5] text-white shadow-xs font-semibold'
              : 'text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
          }`}
        >
          <Folder className="w-3.5 h-3.5" />
          <span>Categories</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-2xl transition-all flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'bg-[#5B4FF5] text-white shadow-xs font-semibold'
              : 'text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Audit Logs</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-2xl transition-all flex items-center gap-2 ${
            activeTab === 'analytics'
              ? 'bg-[#5B4FF5] text-white shadow-xs font-semibold'
              : 'text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Analytics</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div>
        {activeTab === 'overview' && overviewData && (
          <AdminOverview
            overview={overviewData}
            onCreateComponent={handleCreateNew}
            onEditComponent={handleOpenStudio}
            onViewAllComponents={() => setActiveTab('components')}
          />
        )}

        {activeTab === 'components' && (
          <AdminComponentsTable
            onOpenStudio={handleOpenStudio}
            onCreateNew={handleCreateNew}
          />
        )}

        {activeTab === 'studio' && (
          <ComponentStudio
            componentId={selectedStudioComponentId}
            onClose={() => setActiveTab('components')}
            onPublished={(slug) => {
              loadOverview();
            }}
          />
        )}

        {activeTab === 'categories' && <AdminCategories />}

        {activeTab === 'audit' && <AdminAuditLogs />}

        {activeTab === 'analytics' && <AdminAnalytics />}
      </div>
    </div>
  );
};
