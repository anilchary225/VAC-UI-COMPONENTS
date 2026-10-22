import React, { useState, useEffect } from 'react';
import {
  Settings,
  Database,
  Cloud,
  Shield,
  Key,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
  Server,
  Lock,
  ExternalLink,
  Layers,
  Radio,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../../lib/api';

export const AdminConfigure: React.FC = () => {
  const [config, setConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const loadConfig = async () => {
    setError(null);
    try {
      const data = await api.getAdminConfig();
      setConfig(data);
    } catch (err: any) {
      console.error('Failed to load system config:', err);
      setError(err?.message || 'Failed to retrieve system diagnostics.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadConfig();
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="p-16 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-[#5B4FF5]" />
        <span>Loading platform configuration...</span>
      </div>
    );
  }

  if (error && !config) {
    return (
      <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#11131A] border border-rose-500/20 text-rose-400 space-y-3">
        <AlertTriangle className="w-8 h-8 mx-auto text-rose-500" />
        <h3 className="text-sm font-bold text-white">Diagnostics Unavailable</h3>
        <p className="text-xs text-gray-400 max-w-md mx-auto">{error}</p>
        <button
          onClick={loadConfig}
          className="px-5 py-2 rounded-2xl bg-[#5B4FF5] text-white text-xs font-semibold hover:bg-[#4F46E5] transition-all cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#161722] dark:text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#5B4FF5]" />
            System & Platform Configuration
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Real-time status of connected infrastructure services, database clustering, storage drivers, and security modules.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-4 py-2 rounded-2xl bg-white dark:bg-[#11131A] border border-[#E8EAEF] dark:border-white/10 hover:border-[#5B4FF5] text-xs font-semibold text-[#161722] dark:text-white flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#5B4FF5]' : ''}`} />
          <span>Refresh Diagnostics</span>
        </button>
      </div>

      {/* Main Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. Database Connectivity */}
        <div className="p-5 rounded-3xl border border-[#E8EAEF] dark:border-white/10 bg-white dark:bg-[#11131A] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#161722] dark:text-white">Database Cluster</h3>
                <span className="text-[10px] text-gray-400">{config?.database?.type || 'MongoDB'}</span>
              </div>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                config?.database?.status === 'connected'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}
            >
              {config?.database?.status || 'Unknown'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-gray-100 dark:border-white/5">
              <span className="text-gray-400">Connection Mode</span>
              <span className="font-mono text-gray-700 dark:text-gray-300">
                {config?.database?.activePool ? 'Active Replica Pool' : 'Degraded Fallback'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-gray-100 dark:border-white/5">
              <span className="text-gray-400">Target Database</span>
              <span className="font-mono text-[#5B4FF5]">vac_ui_components</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-gray-400">Total Users</span>
              <span className="font-mono text-gray-700 dark:text-gray-300">{config?.stats?.totalUsers ?? 0}</span>
            </div>
          </div>
        </div>

        {/* 2. Registry Storage */}
        <div className="p-5 rounded-3xl border border-[#E8EAEF] dark:border-white/10 bg-white dark:bg-[#11131A] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-[#5B4FF5] flex items-center justify-center">
                <Cloud className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#161722] dark:text-white">Registry Storage</h3>
                <span className="text-[10px] text-gray-400">Immutable Manifest Store</span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold bg-purple-500/10 text-[#5B4FF5] border border-purple-500/20 uppercase">
              {config?.registryStorage?.driver || 'local'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-gray-100 dark:border-white/5">
              <span className="text-gray-400">S3 Adapter</span>
              <span className="font-mono text-gray-700 dark:text-gray-300">
                {config?.registryStorage?.s3Configured ? 'Configured & Active' : 'Fallback / Inactive'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-gray-100 dark:border-white/5">
              <span className="text-gray-400">Bucket Name</span>
              <span className="font-mono text-gray-500 dark:text-gray-400">
                {config?.registryStorage?.s3Bucket || 'Local Cache'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-gray-400">Published Releases</span>
              <span className="font-mono text-emerald-400 font-bold">{config?.stats?.publishedCount ?? 0}</span>
            </div>
          </div>
        </div>

        {/* 3. Authentication & Security */}
        <div className="p-5 rounded-3xl border border-[#E8EAEF] dark:border-white/10 bg-white dark:bg-[#11131A] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#161722] dark:text-white">Authentication & RBAC</h3>
                <span className="text-[10px] text-gray-400">JWT & Secret Keys</span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Secured
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-gray-100 dark:border-white/5">
              <span className="text-gray-400">Session Expiration</span>
              <span className="font-mono text-gray-700 dark:text-gray-300">{config?.security?.jwtExpiresIn || '7d'}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-gray-100 dark:border-white/5">
              <span className="text-gray-400">Bootstrap Admin Mode</span>
              <span
                className={`font-mono text-[11px] font-semibold ${
                  config?.security?.bootstrapOpen ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {config?.security?.bootstrapOpen ? 'Open (0 Admins)' : 'Closed (Active)'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-gray-400">Active Admins</span>
              <span className="font-mono text-gray-700 dark:text-gray-300">{config?.stats?.adminCount ?? 1}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: OAuth Providers & Runtime Host */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* OAuth Integration Status */}
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#11131A] border border-[#E8EAEF] dark:border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#161722] dark:text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-[#5B4FF5]" />
              OAuth 2.0 Social Login Providers
            </h3>
            <span className="text-xs text-gray-400">Public Endpoints</span>
          </div>

          <div className="divide-y divide-[#E8EAEF] dark:divide-white/5 text-xs">
            {/* GitHub */}
            <div className="py-3 flex items-center justify-between gap-2">
              <div className="min-w-0 pr-2">
                <span className="font-semibold text-[#161722] dark:text-white block">GitHub OAuth</span>
                <span className="text-[11px] text-gray-400 font-mono truncate block">/api/auth/oauth/github</span>
              </div>
              <span
                className={`text-[10px] font-mono px-2.5 py-1 rounded-full font-semibold shrink-0 ${
                  config?.oauth?.github
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-400'
                }`}
              >
                {config?.oauth?.github ? 'Configured & Active' : 'Unconfigured'}
              </span>
            </div>

            {/* Google */}
            <div className="py-3 flex items-center justify-between gap-2">
              <div className="min-w-0 pr-2">
                <span className="font-semibold text-[#161722] dark:text-white block">Google OAuth</span>
                <span className="text-[11px] text-gray-400 font-mono truncate block">/api/auth/oauth/google</span>
              </div>
              <span
                className={`text-[10px] font-mono px-2.5 py-1 rounded-full font-semibold shrink-0 ${
                  config?.oauth?.google
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-400'
                }`}
              >
                {config?.oauth?.google ? 'Configured & Active' : 'Unconfigured'}
              </span>
            </div>
          </div>
        </div>

        {/* Runtime Environment Info */}
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#11131A] border border-[#E8EAEF] dark:border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#161722] dark:text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-500" />
              Runtime Environment & Endpoints
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-[#5B4FF5] font-semibold uppercase">
              {config?.nodeEnv || 'development'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 font-mono gap-1 sm:gap-2">
              <span className="text-gray-400 text-[11px] shrink-0">API Host</span>
              <span className="text-gray-800 dark:text-gray-200 text-[11px] flex items-center justify-between sm:justify-end gap-2 truncate">
                <span className="truncate">{`http://localhost:${config?.port || 4000}/api`}</span>
                <button
                  onClick={() => copyToClipboard(`http://localhost:${config?.port || 4000}/api`, 'api')}
                  className="text-gray-400 hover:text-white cursor-pointer shrink-0"
                >
                  {copiedKey === 'api' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 font-mono gap-1 sm:gap-2">
              <span className="text-gray-400 text-[11px] shrink-0">Frontend Host</span>
              <span className="text-gray-800 dark:text-gray-200 text-[11px] flex items-center justify-between sm:justify-end gap-2 truncate">
                <span className="truncate">{config?.frontendUrl || 'http://localhost:5173'}</span>
                <button
                  onClick={() => copyToClipboard(config?.frontendUrl || 'http://localhost:5173', 'frontend')}
                  className="text-gray-400 hover:text-white cursor-pointer shrink-0"
                >
                  {copiedKey === 'frontend' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 font-mono gap-1 sm:gap-2">
              <span className="text-gray-400 text-[11px] shrink-0">Engine Version</span>
              <span className="text-gray-800 dark:text-gray-200 text-[11px] truncate">
                v{config?.version || '1.0.0'} (Release Candidate)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
