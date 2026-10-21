import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Layers,
  Compass,
  Bookmark,
  FolderHeart,
  Clock,
  Settings,
  LayoutDashboard,
  Shield,
  Tag,
  PackageCheck,
  Users,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../features/auth/authStore';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const { user } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === 'admin';

  const userNav = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Components', href: '/components', icon: Layers },
    { label: 'Favorites', href: '/favorites', icon: Bookmark, badge: 'Auth' },
    { label: 'Collections', href: '/collections', icon: FolderHeart, badge: 'Auth' },
    { label: 'Recently Viewed', href: '/history', icon: Clock },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const adminNav = [
    { label: 'Studio Overview', href: '/admin', icon: Shield },
    { label: 'Manage Components', href: '/admin/components', icon: Layers },
    { label: 'Categories', href: '/admin/categories', icon: Tag },
    { label: 'Releases & Registry', href: '/admin/registry', icon: PackageCheck },
    { label: 'User Directory', href: '/admin/users', icon: Users },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart2 },
    { label: 'Admin Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r transition-all duration-200 select-none z-30',
        'bg-white dark:bg-[#0A0B10] border-[#E7E9F0] dark:border-white/10',
        isCollapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Brand Header */}
      <div className="h-14 flex items-center px-4 border-b border-[#E7E9F0] dark:border-white/10 justify-between">
        <NavLink to="/" className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-indigo-600/30">
            <Sparkles className="w-4 h-4" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-tight text-gray-900 dark:text-white">
                VAC<span className="text-indigo-500 font-bold">.UI</span>
              </span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono tracking-wider uppercase">
                Dev Studio
              </span>
            </div>
          )}
        </NavLink>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {/* User Navigation Section */}
        <div>
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Workspace
            </div>
          )}
          <nav className="space-y-1">
            {userNav.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/dashboard'
                  ? location.pathname === '/' || location.pathname === '/dashboard'
                  : location.pathname.startsWith(item.href);

              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-btn text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 dark:bg-indigo-500/15'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-[#9CA3AF] dark:hover:text-[#F4F5F8] dark:hover:bg-white/[0.04]',
                    isCollapsed && 'justify-center px-0'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Admin Section (Strictly displayed only to authenticated admins) */}
        {isAdmin && (
          <div>
            {!isCollapsed && (
              <div className="px-3 pb-2 text-[10px] font-semibold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3 h-3" />
                Admin Studio
              </div>
            )}
            <nav className="space-y-1">
              {adminNav.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.href);

                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    title={isCollapsed ? item.label : undefined}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-btn text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-amber-500/10 text-amber-500 dark:bg-amber-500/15'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-[#9CA3AF] dark:hover:text-[#F4F5F8] dark:hover:bg-white/[0.04]',
                      isCollapsed && 'justify-center px-0'
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Collapse Footer */}
      <div className="p-2 border-t border-[#E7E9F0] dark:border-white/10 flex items-center justify-between">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-2 rounded-btn text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/[0.05] transition-colors text-xs gap-2"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse Sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
