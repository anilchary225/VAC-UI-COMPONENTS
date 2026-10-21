import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Search,
  Moon,
  Sun,
  Bell,
  BookOpen,
  User,
  LogOut,
  Shield,
  Check,
  ChevronRight,
} from 'lucide-react';
import { useTheme } from '../../features/theme/themeStore';
import { useAuth } from '../../features/auth/authStore';
import { Button } from '../ui/Button';

interface TopbarProps {
  onOpenCommandPalette: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenCommandPalette }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, openAuthModal } = useAuth();
  const location = useLocation();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Generate breadcrumb items from current path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = [
    { label: 'VAC UI', path: '/' },
    ...pathParts.map((part, index) => ({
      label: part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' '),
      path: '/' + pathParts.slice(0, index + 1).join('/'),
    })),
  ];

  return (
    <header className="h-14 border-b border-[#E7E9F0] dark:border-white/10 bg-white dark:bg-[#0A0B10] px-4 flex items-center justify-between shrink-0 z-20">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 overflow-hidden max-w-xs md:max-w-md">
        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          return (
            <React.Fragment key={crumb.path}>
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 shrink-0 text-gray-300 dark:text-gray-600" />}
              {isLast ? (
                <span className="font-medium text-gray-900 dark:text-[#F4F5F8] truncate">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.path}
                  className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors truncate"
                >
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Center/Right Actions */}
      <div className="flex items-center gap-2.5">
        {/* Search trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-3 px-3 py-1.5 rounded-btn border border-[#E7E9F0] dark:border-white/10 bg-gray-50 dark:bg-[#11131A] text-xs text-gray-400 dark:text-gray-500 hover:border-gray-300 dark:hover:border-white/20 transition-all w-48 sm:w-64 justify-between"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5" />
            <span className="text-gray-400 truncate">Quick search components...</span>
          </div>
          <kbd className="hidden sm:inline-block font-mono text-[10px] px-1.5 py-0.5 rounded bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400">
            ⌘K
          </kbd>
        </button>

        {/* Documentation Link */}
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          title="Documentation"
          className="p-2 rounded-btn text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-colors"
        >
          <BookOpen className="w-4 h-4" />
        </a>

        {/* Notifications toggle */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            title="System Updates"
            className="relative p-2 rounded-btn text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-white dark:ring-[#0A0B10]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-panel bg-white dark:bg-[#11131A] border border-[#E7E9F0] dark:border-white/10 shadow-xl p-3 z-50 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-[#E7E9F0] dark:border-white/10 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Release Activity
                </span>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-1.5 py-0.5 rounded">
                  v1.0.0 Ready
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-btn bg-gray-50 dark:bg-white/[0.03]">
                  <p className="font-medium text-gray-900 dark:text-white">Catalog Initialized</p>
                  <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5">
                    6 official production-grade React components are now ready for preview and CLI installation.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-btn text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>

        {/* User Account / Sign In */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-btn hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-colors text-xs font-medium"
            >
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline text-gray-700 dark:text-gray-200">{user.name}</span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-panel bg-white dark:bg-[#11131A] border border-[#E7E9F0] dark:border-white/10 shadow-xl py-1 z-50 animate-fade-in">
                <div className="px-3 py-2 border-b border-[#E7E9F0] dark:border-white/10">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 uppercase">
                    {user.role}
                  </span>
                </div>
                <Link
                  to="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.05] flex items-center gap-2"
                >
                  <User className="w-3.5 h-3.5" />
                  Account Settings
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setShowUserMenu(false)}
                    className="w-full text-left px-3 py-2 text-xs text-amber-500 hover:bg-gray-100 dark:hover:bg-white/[0.05] flex items-center gap-2"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Admin Studio
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-gray-100 dark:hover:bg-white/[0.05] flex items-center gap-2 border-t border-[#E7E9F0] dark:border-white/10"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => openAuthModal('login')}>
              Sign In
            </Button>
            <Button size="sm" variant="primary" onClick={() => openAuthModal('register')}>
              Sign Up
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};
