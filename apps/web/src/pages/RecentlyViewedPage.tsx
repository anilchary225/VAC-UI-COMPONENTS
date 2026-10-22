import React, { useState } from 'react';
import { Clock, ArrowRight, Terminal, Trash2, Check } from 'lucide-react';
import { useRecentlyViewed } from '../features/history/useRecentlyViewed';
import { Link, useNavigate } from 'react-router-dom';

const CATALOG_COMPONENTS_MAP: Record<string, { title: string; category: string; cli: string }> = {
  'animated-login-form': {
    title: 'Animated Login Form',
    category: 'Auth & Form Fields',
    cli: 'npx vac-ui-components add animated-login-form',
  },
  'glassmorphism-navbar': {
    title: 'Glassmorphism Navbar',
    category: 'Navigation Shells',
    cli: 'npx vac-ui-components add glassmorphism-navbar',
  },
  'interactive-pricing': {
    title: 'Interactive Pricing Tier',
    category: 'Tactile Micro-UX',
    cli: 'npx vac-ui-components add interactive-pricing',
  },
  'analytics-dashboard': {
    title: 'Analytics Metrics Matrix',
    category: 'Telemetry & Charts',
    cli: 'npx vac-ui-components add analytics-dashboard',
  },
  'notification-center': {
    title: 'Notification Center Feed',
    category: 'Feedback & Loaders',
    cli: 'npx vac-ui-components add notification-center',
  },
  'file-upload': {
    title: 'Drag & Drop File Upload',
    category: 'Auth & Form Fields',
    cli: 'npx vac-ui-components add file-upload',
  },
  'glass-button': {
    title: 'Glass Pill Button',
    category: 'Action Triggers',
    cli: 'npx vac-ui-components add glass-button',
  },
  'toggle-switch': {
    title: 'Animated Toggle Switch',
    category: 'Action Triggers',
    cli: 'npx vac-ui-components add toggle-switch',
  },
  'dark-glass-card': {
    title: 'Spotlight Ambient Card',
    category: 'Surface Cards',
    cli: 'npx vac-ui-components add dark-glass-card',
  },
};

export const RecentlyViewedPage: React.FC = () => {
  const { history, clearHistory } = useRecentlyViewed();
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const navigate = useNavigate();

  const copyCli = (command: string, slug: string) => {
    navigator.clipboard.writeText(command);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${Math.floor(diffHours / 24)}d ago`;
    } catch {
      return 'Recently';
    }
  };

  const items = history
    .map((h) => {
      const info = CATALOG_COMPONENTS_MAP[h.slug];
      return {
        slug: h.slug,
        visitedAt: h.visitedAt,
        title: info?.title || h.slug,
        category: info?.category || 'Component',
        cli: info?.cli || `npx vac-ui-components add ${h.slug}`,
      };
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#161722] dark:text-white">
            Recently Viewed
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Components you have inspected and previewed during your sessions ({items.length} logged).
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={clearHistory}
            className="self-start sm:self-auto text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-[#E8EAEF] dark:border-white/10 p-8 bg-white dark:bg-[#11131A]">
          <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-[#161722] dark:text-white">History is empty</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto mb-4">
            Components you inspect in the catalog will automatically appear here for rapid resumption.
          </p>
          <Link to="/components">
            <button className="px-4 py-2 rounded-full border border-gray-200 dark:border-white/10 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 inline-flex items-center gap-1.5 transition-all">
              Explore Catalog <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <div
              key={item.slug}
              onClick={() => navigate(`/components/${item.slug}`)}
              className="group p-5 rounded-2xl bg-white dark:bg-[#11131A] border border-[#E8EAEF] dark:border-white/10 hover:border-[#5B4FF5]/50 transition-all shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#5B4FF5] bg-[#5B4FF5]/10 px-2 py-0.5 rounded-full font-medium">
                    {item.category}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {formatRelativeTime(item.visitedAt)}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#161722] dark:text-white group-hover:text-[#5B4FF5] transition-colors mt-2">
                  {item.title}
                </h4>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-[#E8EAEF] dark:border-white/5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyCli(item.cli, item.slug);
                  }}
                  className="px-3 py-1.5 rounded-full bg-[#181A25] hover:bg-black text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Copy install command"
                >
                  {copiedSlug === item.slug ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Terminal className="w-3.5 h-3.5 text-purple-300" />
                      <span>Copy CLI</span>
                    </>
                  )}
                </button>

                <span className="text-[11px] text-[#5B4FF5] flex items-center gap-0.5 font-medium group-hover:translate-x-1 transition-transform">
                  Inspect <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
