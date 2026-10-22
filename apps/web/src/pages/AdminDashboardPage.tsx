import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Shield,
  Layers,
  Sparkles,
  Plus,
  BarChart2,
  Folder,
  History,
  LayoutDashboard,
  PackageCheck,
  Settings,
  Users,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../features/auth/authStore';
import { api } from '../lib/api';
import { AdminOverview } from '../features/admin/AdminOverview';
import { AdminComponentsTable } from '../features/admin/AdminComponentsTable';
import { ComponentStudio } from '../features/admin/ComponentStudio';
import { AdminAuditLogs } from '../features/admin/AdminAuditLogs';
import { AdminAnalytics } from '../features/admin/AdminAnalytics';
import { AdminCategories } from '../features/admin/AdminCategories';
import { AdminConfigure } from '../features/admin/AdminConfigure';
import { AdminRegistryReleases } from '../features/admin/AdminRegistryReleases';
import { AdminUsers } from '../features/admin/AdminUsers';

export type AdminTab =
  | 'overview'
  | 'components'
  | 'studio'
  | 'categories'
  | 'registry'
  | 'configure'
  | 'users'
  | 'audit'
  | 'analytics';

export const AdminDashboardPage: React.FC = () => {
  const { user, login, openAuthModal } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();

  // Normalize incoming tab parameter
  const resolveTab = (raw?: string): AdminTab => {
    switch (raw?.toLowerCase()) {
      case 'components':
        return 'components';
      case 'studio':
        return 'studio';
      case 'categories':
        return 'categories';
      case 'registry':
        return 'registry';
      case 'configure':
        return 'configure';
      case 'users':
        return 'users';
      case 'audit':
      case 'audit-logs':
        return 'audit';
      case 'analytics':
        return 'analytics';
      default:
        return 'overview';
    }
  };

  const activeTab = resolveTab(tab);

  const handleTabChange = (newTab: AdminTab) => {
    if (newTab === 'overview') {
      navigate('/admin');
    } else {
      navigate(`/admin/${newTab}`);
    }
  };

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
  const [overviewError, setOverviewError] = useState<string | null>(null);

  const loadOverview = async () => {
    if (!isAdmin) return;
    setIsLoading(true);
    setOverviewError(null);
    try {
      const data = await api.getAdminOverview();
      setOverviewData(data);
    } catch (err: any) {
      console.error('Failed to load admin overview:', err);
      setOverviewError(err?.message || 'Failed to load administrator overview.');
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
    handleTabChange('studio');
  };

  const handleCreateNew = () => {
    setSelectedStudioComponentId(null);
    handleTabChange('studio');
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
          The Component Studio, Registry, and platform configuration are strictly restricted to verified administrative users.
          Sign in with an administrative account or authenticate using the pre-configured admin profile.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleDemoAdminSignIn}
            className="px-6 py-2.5 rounded-full bg-[#5B4FF5] hover:bg-[#4F46E5] text-white text-xs font-semibold shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sign In as Demo Admin</span>
          </button>
          <button
            onClick={() => openAuthModal('login')}
            className="px-6 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 text-gray-800 dark:text-white text-xs font-semibold transition-all cursor-pointer"
          >
            Custom Sign In
          </button>
        </div>
      </div>
    );
  }

  const tabs: Array<{ id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'components', label: 'Components', icon: Layers },
    { id: 'studio', label: 'Studio', icon: Sparkles },
    { id: 'categories', label: 'Categories', icon: Folder },
    { id: 'registry', label: 'Releases & Registry', icon: PackageCheck },
    { id: 'configure', label: 'Configure', icon: Settings },
    { id: 'users', label: 'User Directory', icon: Users },
    { id: 'audit', label: 'Audit Logs', icon: History },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  ];

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
            Catalog & Platform Management
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Author component drafts, manage system categories, inspect releases, and verify runtime infrastructure.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 rounded-2xl bg-[#5B4FF5] hover:bg-[#4F46E5] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Component</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-[#E8EAEF] dark:border-white/10 pb-2 text-xs font-medium overflow-x-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;

          return (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id)}
              className={`px-3.5 py-2 rounded-2xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#5B4FF5] text-white shadow-xs font-semibold'
                  : 'text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div>
        {activeTab === 'overview' && (
          isLoading && !overviewData ? (
            <div className="space-y-6 animate-pulse" data-testid="overview-loading">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-28 rounded-3xl bg-gray-100 dark:bg-white/[0.03] border border-[#E8EAEF] dark:border-white/5" />
                ))}
              </div>
              <div className="h-64 rounded-3xl bg-gray-100 dark:bg-white/[0.03] border border-[#E8EAEF] dark:border-white/5" />
            </div>
          ) : overviewError && !overviewData ? (
            <div className="p-8 text-center rounded-3xl bg-white dark:bg-[#11131A] border border-rose-500/20 text-rose-400 space-y-3" data-testid="overview-error">
              <AlertTriangle className="w-8 h-8 mx-auto text-rose-500" />
              <p className="text-xs">{overviewError}</p>
              <button
                onClick={loadOverview}
                className="px-4 py-2 rounded-2xl bg-[#5B4FF5] text-white text-xs font-semibold hover:bg-[#4F46E5] transition-all cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : overviewData ? (
            <AdminOverview
              overview={overviewData}
              onCreateComponent={handleCreateNew}
              onEditComponent={handleOpenStudio}
              onViewAllComponents={() => handleTabChange('components')}
            />
          ) : null
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
            onClose={() => handleTabChange('components')}
            onPublished={(_slug) => {
              loadOverview();
            }}
          />
        )}

        {activeTab === 'categories' && <AdminCategories />}

        {activeTab === 'registry' && <AdminRegistryReleases />}

        {activeTab === 'configure' && <AdminConfigure />}

        {activeTab === 'users' && <AdminUsers />}

        {activeTab === 'audit' && <AdminAuditLogs />}

        {activeTab === 'analytics' && <AdminAnalytics />}
      </div>
    </div>
  );
};
