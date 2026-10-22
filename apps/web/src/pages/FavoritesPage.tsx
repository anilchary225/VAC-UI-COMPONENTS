import React, { useState } from 'react';
import { Bookmark, Lock, ArrowRight, Terminal, Trash2, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../features/auth/authStore';
import { useFavorites } from '../features/favorites/useFavorites';
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

export const FavoritesPage: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const { favorites, toggleFavorite, loading } = useFavorites();
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const navigate = useNavigate();

  const copyCli = (command: string, slug: string) => {
    navigator.clipboard.writeText(command);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

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
          className="px-5 py-2.5 rounded-full bg-[#181A25] hover:bg-black text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
        >
          Sign In to Account
        </button>
      </div>
    );
  }

  const favoriteItems = favorites
    .map((slug) => {
      const info = CATALOG_COMPONENTS_MAP[slug];
      return {
        slug,
        title: info?.title || slug,
        category: info?.category || 'Components',
        cli: info?.cli || `npx vac-ui-components add ${slug}`,
      };
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#161722] dark:text-white">
            My Favorites
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Your bookmarked components for fast reference and implementation ({favorites.length} saved).
          </p>
        </div>
        <Link to="/components" className="self-start sm:self-auto">
          <button className="px-4 py-2 rounded-full border border-gray-200 dark:border-white/10 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 inline-flex items-center gap-1.5 transition-all cursor-pointer">
            Browse Catalog <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-gray-400">Loading your favorites...</div>
      ) : favoriteItems.length === 0 ? (
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
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {favoriteItems.map((item) => (
            <div
              key={item.slug}
              onClick={() => navigate(`/components/${item.slug}`)}
              className="group p-5 rounded-2xl bg-white dark:bg-[#11131A] border border-[#E8EAEF] dark:border-white/10 hover:border-[#5B4FF5]/50 transition-all shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#5B4FF5] bg-[#5B4FF5]/10 px-2 py-0.5 rounded-full font-medium">
                  {item.category}
                </span>
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

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(item.slug);
                  }}
                  className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  title="Remove from favorites"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
