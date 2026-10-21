import React from 'react';
import {
  Layers,
  CheckCircle2,
  FileEdit,
  AlertTriangle,
  History,
  Plus,
  ArrowRight,
  ExternalLink,
  Shield,
  Clock,
} from 'lucide-react';

interface AdminOverviewProps {
  overview: {
    totalComponents: number;
    publishedCount: number;
    draftCount: number;
    deprecatedCount: number;
    validationIssuesCount: number;
    recentComponents: Array<{
      id: string;
      slug: string;
      name: string;
      category: string;
      status: string;
      currentVersion: string;
      updatedAt: string;
    }>;
    recentAuditLogs: Array<{
      id: string;
      action: string;
      actorEmail: string;
      actorName: string;
      resourceType: string;
      resourceId: string;
      details: Record<string, any>;
      createdAt: string;
    }>;
  };
  onCreateComponent: () => void;
  onEditComponent: (slugOrId: string) => void;
  onViewAllComponents: () => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  overview,
  onCreateComponent,
  onEditComponent,
  onViewAllComponents,
}) => {
  return (
    <div className="space-y-8">
      {/* Real Aggregate Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-3xl border border-[#E8EAEF] dark:border-white/10 bg-white dark:bg-[#11131A] shadow-xs transition-colors">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Total Catalog Items</span>
            <Layers className="w-4 h-4 text-[#5B4FF5]" />
          </div>
          <p className="text-3xl font-bold text-[#161722] dark:text-white mt-2">
            {overview.totalComponents}
          </p>
          <span className="text-[10px] text-gray-400 mt-1 block">
            Across 7 system categories
          </span>
        </div>

        <div className="p-5 rounded-3xl border border-[#E8EAEF] dark:border-white/10 bg-white dark:bg-[#11131A] shadow-xs transition-colors">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Published Releases</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-emerald-500 mt-2">
            {overview.publishedCount}
          </p>
          <span className="text-[10px] text-emerald-600/70 dark:text-emerald-400/60 mt-1 block">
            Active in public catalog
          </span>
        </div>

        <div className="p-5 rounded-3xl border border-[#E8EAEF] dark:border-white/10 bg-white dark:bg-[#11131A] shadow-xs transition-colors">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Studio Drafts</span>
            <FileEdit className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-bold text-amber-500 mt-2">
            {overview.draftCount}
          </p>
          <span className="text-[10px] text-amber-600/70 dark:text-amber-400/60 mt-1 block">
            Isolated from catalog users
          </span>
        </div>

        <div className="p-5 rounded-3xl border border-[#E8EAEF] dark:border-white/10 bg-white dark:bg-[#11131A] shadow-xs transition-colors">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Validation Warnings</span>
            <AlertTriangle className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-[#161722] dark:text-white mt-2">
            {overview.validationIssuesCount}
          </p>
          <span className="text-[10px] text-gray-400 mt-1 block">
            Requiring admin review
          </span>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-500/10 via-[#5B4FF5]/5 to-transparent border border-[#5B4FF5]/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-[#161722] dark:text-white">
            Component Studio Quick Launch
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Create new custom drafts, inspect source files, or cut a verified release.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onCreateComponent}
            className="px-4 py-2 rounded-xl bg-[#5B4FF5] hover:bg-[#4F46E5] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Component</span>
          </button>

          <a
            href="/components"
            className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span>Open Public Catalog</span>
            <ExternalLink className="w-3 h-3 text-[#5B4FF5]" />
          </a>
        </div>
      </div>

      {/* Two Column Section: Recently Updated & Audit Log Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recently Updated Components */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#11131A] border border-[#E8EAEF] dark:border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#161722] dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#5B4FF5]" />
              Recently Updated Components
            </h3>
            <button
              onClick={onViewAllComponents}
              className="text-xs text-[#5B4FF5] hover:underline flex items-center gap-1 font-medium"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-[#E8EAEF] dark:divide-white/5">
            {overview.recentComponents.map((c) => (
              <div
                key={c.slug}
                onClick={() => onEditComponent(c.slug)}
                className="py-3 flex items-center justify-between text-xs hover:bg-gray-50/50 dark:hover:bg-white/[0.02] px-2 rounded-xl cursor-pointer transition-colors"
              >
                <div>
                  <h4 className="font-semibold text-[#161722] dark:text-white">
                    {c.name}
                  </h4>
                  <span className="text-[11px] text-gray-400">
                    {c.category} · v{c.currentVersion}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      c.status === 'published'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-amber-500/10 text-amber-400'
                    }`}
                  >
                    {c.status}
                  </span>
                  <span className="text-gray-400 text-[11px]">
                    {new Date(c.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audit Log Preview */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#11131A] border border-[#E8EAEF] dark:border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-[#161722] dark:text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            Recent Administrative Actions
          </h3>

          <div className="divide-y divide-[#E8EAEF] dark:divide-white/5">
            {overview.recentAuditLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-[#5B4FF5]">{log.action}</span>
                    <span className="text-gray-400 text-[11px] font-mono">[{log.resourceId}]</span>
                  </div>
                  <span className="text-[11px] text-gray-500">By {log.actorName}</span>
                </div>
                <span className="text-[11px] text-gray-400 font-mono">
                  {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
