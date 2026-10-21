import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Terminal,
  Check,
  Copy,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Bookmark,
  FolderHeart,
  Clock,
} from 'lucide-react';
import { api } from '../lib/api';
import { ComponentSummary } from '@vac/shared';
import { useRecentlyViewed } from '../features/history/useRecentlyViewed';
import { useFavorites } from '../features/favorites/useFavorites';
import { useCollections } from '../features/collections/useCollections';
import { useAuth } from '../features/auth/authStore';

const FALLBACK_COMPONENTS: ComponentSummary[] = [
  {
    id: 'comp_animated_login',
    slug: 'animated-login-form',
    name: 'Animated Login Form',
    description: 'Smooth interactive login card with spring animations, floating labels, validation states, and theme toggling.',
    category: 'Auth & Form Fields',
    tags: ['Auth', 'Form', 'Animation', 'Tailwind', 'Motion'],
    status: 'published',
    currentVersion: '1.0.0',
    isOfficial: true,
    downloadsCount: 1420,
    favoritesCount: 382,
    createdAt: '2026-01-15T10:00:00.000Z',
    updatedAt: '2026-02-01T12:00:00.000Z',
  },
  {
    id: 'comp_file_upload',
    slug: 'file-upload',
    name: 'Drag & Drop File Upload',
    description: 'Interactive file dropzone with progress tracking, file type validation, and remove actions.',
    category: 'Auth & Form Fields',
    tags: ['Upload', 'Files', 'DragAndDrop'],
    status: 'published',
    currentVersion: '1.0.0',
    isOfficial: true,
    downloadsCount: 1150,
    favoritesCount: 290,
    createdAt: '2026-01-28T10:00:00.000Z',
    updatedAt: '2026-02-06T12:00:00.000Z',
  },
  {
    id: 'comp_glassmorphism_navbar',
    slug: 'glassmorphism-navbar',
    name: 'Glassmorphism Navbar',
    description: 'Translucent floating header with frosted glass refraction, responsive menu, and quick action buttons.',
    category: 'Navigation Shells',
    tags: ['Navigation', 'Glassmorphism', 'Header'],
    status: 'published',
    currentVersion: '1.0.0',
    isOfficial: true,
    downloadsCount: 980,
    favoritesCount: 245,
    createdAt: '2026-01-18T10:00:00.000Z',
    updatedAt: '2026-02-02T12:00:00.000Z',
  },
  {
    id: 'comp_interactive_pricing',
    slug: 'interactive-pricing',
    name: 'Interactive Pricing Tier',
    description: 'Tiered subscription pricing grid with monthly/annual billing switch, highlight badges, and feature comparison list.',
    category: 'Tactile Micro-UX',
    tags: ['Pricing', 'Billing', 'Interactive'],
    status: 'published',
    currentVersion: '1.0.0',
    isOfficial: true,
    downloadsCount: 870,
    favoritesCount: 195,
    createdAt: '2026-01-20T10:00:00.000Z',
    updatedAt: '2026-02-03T12:00:00.000Z',
  },
  {
    id: 'comp_analytics_dashboard',
    slug: 'analytics-dashboard',
    name: 'Analytics Dashboard',
    description: 'Metric summary panels with sparkline indicators, trend percentages, and time-range filtering.',
    category: 'Telemetry & Charts',
    tags: ['Dashboard', 'Analytics', 'Metrics'],
    status: 'published',
    currentVersion: '1.0.0',
    isOfficial: true,
    downloadsCount: 1210,
    favoritesCount: 312,
    createdAt: '2026-01-22T10:00:00.000Z',
    updatedAt: '2026-02-04T12:00:00.000Z',
  },
  {
    id: 'comp_notification_center',
    slug: 'notification-center',
    name: 'Notification Center Feed',
    description: 'Actionable alert feed with read/unread markers, category tabs, and mark-all-read shortcuts.',
    category: 'Feedback & Loaders',
    tags: ['Notifications', 'Flyout', 'Alerts'],
    status: 'published',
    currentVersion: '1.0.0',
    isOfficial: true,
    downloadsCount: 760,
    favoritesCount: 180,
    createdAt: '2026-01-25T10:00:00.000Z',
    updatedAt: '2026-02-05T12:00:00.000Z',
  },
  {
    id: 'comp_glass_button',
    slug: 'glass-button',
    name: 'Glass Pill Button',
    description: 'High-contrast backdrop blurred action button with ambient glow and tactile click physics.',
    category: 'Action Triggers',
    tags: ['Button', 'Glass', 'Controls'],
    status: 'published',
    currentVersion: '1.0.0',
    isOfficial: true,
    downloadsCount: 940,
    favoritesCount: 210,
    createdAt: '2026-02-01T10:00:00.000Z',
    updatedAt: '2026-02-07T12:00:00.000Z',
  },
  {
    id: 'comp_toggle_switch',
    slug: 'toggle-switch',
    name: 'Animated Toggle Switch',
    description: 'Tactile boolean toggle switch with spring physics and keyboard focus indicators.',
    category: 'Action Triggers',
    tags: ['Toggle', 'Switch', 'Motion'],
    status: 'published',
    currentVersion: '1.0.0',
    isOfficial: true,
    downloadsCount: 890,
    favoritesCount: 175,
    createdAt: '2026-02-02T10:00:00.000Z',
    updatedAt: '2026-02-08T12:00:00.000Z',
  },
  {
    id: 'comp_dark_glass_card',
    slug: 'dark-glass-card',
    name: 'Spotlight Ambient Card',
    description: 'Deep translucent component card with mouse-tracking radial ambient illumination.',
    category: 'Surface Cards',
    tags: ['Card', 'Spotlight', 'Dark'],
    status: 'published',
    currentVersion: '1.0.0',
    isOfficial: true,
    downloadsCount: 810,
    favoritesCount: 190,
    createdAt: '2026-02-03T10:00:00.000Z',
    updatedAt: '2026-02-09T12:00:00.000Z',
  },
];

export const OverviewPage: React.FC = () => {
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [components, setComponents] = useState<ComponentSummary[]>(FALLBACK_COMPONENTS);
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuth();
  const { history } = useRecentlyViewed();
  const { favorites } = useFavorites();
  const { collections } = useCollections();

  const installCommand = 'npx vac-ui-components add animated-login-form';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(installCommand);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  useEffect(() => {
    api
      .getComponents()
      .then((data) => {
        if (data && data.length > 0) {
          setComponents(data);
        }
      })
      .catch((err) => console.warn('Failed to fetch components overview:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const displayComponents = components.length > 0 ? components : FALLBACK_COMPONENTS;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      {/* Welcome Banner with Twilight Gradient */}
      <div className="relative rounded-3xl overflow-hidden border border-purple-500/20 bg-gradient-to-r from-[#291A57] via-[#211545] to-[#170E33] p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-mono mb-4">
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>VAC-UI-COMPONENTS · Developer Platform v1.0.0</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
            Minimal, production-ready React components.
          </h1>
          <p className="text-xs sm:text-sm text-purple-100/80 leading-relaxed mb-6 font-normal">
            Explore curated UI components built with React, TypeScript, and Motion.
            Directly copy source files or install in seconds using the verified VAC CLI.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/components">
              <button className="px-5 py-2.5 rounded-full bg-[#5B4FF5] hover:bg-[#4F46E5] text-white text-xs font-semibold shadow-md shadow-indigo-900/40 transition-all flex items-center gap-2 cursor-pointer">
                <Layers className="w-4 h-4" />
                Browse Catalog
              </button>
            </Link>

            {/* Quick Install snippet */}
            <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-full px-4 py-2 font-mono text-xs text-gray-300">
              <Terminal className="w-3.5 h-3.5 text-purple-300 shrink-0" />
              <span>{installCommand}</span>
              <button
                onClick={copyToClipboard}
                title="Copy installation command"
                className="ml-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics & Personal Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Link
          to="/components"
          className="p-5 rounded-2xl border border-[#E8EAEF] dark:border-white/10 bg-white dark:bg-[#11131A] shadow-xs flex flex-col justify-between hover:border-[#5B4FF5]/50 transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#7C7299]">Official Catalog</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-white/5 flex items-center justify-center text-[#5B4FF5] group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-[#161722] dark:text-white mt-3">
              {displayComponents.length}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Curated components ready for production →
            </p>
          </div>
        </Link>

        {user ? (
          <Link
            to="/favorites"
            className="p-5 rounded-2xl border border-[#E8EAEF] dark:border-white/10 bg-white dark:bg-[#11131A] shadow-xs flex flex-col justify-between hover:border-[#5B4FF5]/50 transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#7C7299]">Saved Favorites</span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-[#5B4FF5] group-hover:scale-110 transition-transform">
                <Bookmark className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#161722] dark:text-white mt-3">
                {favorites.length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Components bookmarked in your workspace →
              </p>
            </div>
          </Link>
        ) : (
          <div className="p-5 rounded-2xl border border-[#E8EAEF] dark:border-white/10 bg-white dark:bg-[#11131A] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#7C7299]">CLI Additions</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-white/5 flex items-center justify-center text-[#10B981]">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#161722] dark:text-white mt-3">
                6,390+
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Verified developer additions
              </p>
            </div>
          </div>
        )}

        {user ? (
          <Link
            to="/collections"
            className="p-5 rounded-2xl border border-[#E8EAEF] dark:border-white/10 bg-white dark:bg-[#11131A] shadow-xs flex flex-col justify-between hover:border-[#5B4FF5]/50 transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#7C7299]">My Collections</span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-[#5B4FF5] group-hover:scale-110 transition-transform">
                <FolderHeart className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#161722] dark:text-white mt-3">
                {collections.length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Custom project boards organized →
              </p>
            </div>
          </Link>
        ) : (
          <div className="p-5 rounded-2xl border border-[#E8EAEF] dark:border-white/10 bg-white dark:bg-[#11131A] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#7C7299]">Registry Status</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-white/5 flex items-center justify-center text-[#F59E0B]">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#161722] dark:text-white mt-3">
                100% Immutable
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Semver releases & integrity verification
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Recently Viewed Resume Bar (when user has recent activity) */}
      {history.length > 0 && (
        <div className="p-4 rounded-2xl bg-white dark:bg-[#11131A] border border-[#E8EAEF] dark:border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#161722] dark:text-white shrink-0">
            <Clock className="w-4 h-4 text-[#5B4FF5]" />
            <span>Recently Viewed:</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {history.slice(0, 5).map((it) => (
              <Link
                key={it.slug}
                to={`/components/${it.slug}`}
                className="px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-[11px] font-mono text-[#5B4FF5] shrink-0 transition-colors"
              >
                {it.slug}
              </Link>
            ))}
          </div>
          <Link
            to="/history"
            className="text-xs text-[#5B4FF5] hover:underline shrink-0 font-medium"
          >
            All history →
          </Link>
        </div>
      )}

      {/* Featured Components Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#161722] dark:text-white">
              Official Components ({displayComponents.length})
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Click any component to inspect its code, props, and install instructions in the catalog.
            </p>
          </div>
          <Link
            to="/components"
            className="text-xs font-medium text-[#5B4FF5] hover:underline flex items-center gap-1"
          >
            View all components <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-44 rounded-2xl bg-gray-100 dark:bg-[#11131A] animate-pulse border border-gray-200 dark:border-white/5"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayComponents.map((comp) => (
              <Link
                key={comp.slug}
                to={`/components/${comp.slug}`}
                className="group p-5 rounded-2xl border border-[#E8EAEF] dark:border-white/10 bg-white dark:bg-[#11131A] hover:border-[#5B4FF5] hover:shadow-xl dark:hover:shadow-purple-500/10 transition-all flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#5B4FF5] bg-[#5B4FF5]/10 px-2.5 py-0.5 rounded-full font-medium">
                      {comp.category}
                    </span>
                    <span className="text-[11px] font-mono text-gray-400">
                      v{comp.currentVersion}
                    </span>
                  </div>
                  <h3 className="font-bold text-[#161722] dark:text-white text-base group-hover:text-[#5B4FF5] transition-colors">
                    {comp.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {comp.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[#E8EAEF] dark:border-white/10 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {comp.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-[#181A25] dark:text-white group-hover:text-[#5B4FF5] group-hover:translate-x-1 transition-all inline-flex items-center gap-1">
                    Inspect <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
