import React from 'react';
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
  History,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Bot,
  Wrench,
  Globe,
  MoreHorizontal,
  ChevronDown,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../features/auth/authStore';
import { VacLogo } from '../ui/VacLogo';

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
    { label: 'Components', href: '/components', icon: Layers, badge: '9' },
    { label: 'Favorites', href: '/favorites', icon: Bookmark },
    { label: 'Collections', href: '/collections', icon: FolderHeart },
    { label: 'Recently Viewed', href: '/history', icon: Clock },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const adminNav = [
    { label: 'Studio Overview', href: '/admin', icon: Shield },
    { label: 'Manage Components', href: '/admin/components', icon: Layers },
    { label: 'Categories', href: '/admin/categories', icon: Tag },
    { label: 'Releases & Registry', href: '/admin/registry', icon: PackageCheck },
    { label: 'Configure Platform', href: '/admin/configure', icon: Settings },
    { label: 'User Directory', href: '/admin/users', icon: Users },
    { label: 'Audit Logs', href: '/admin/audit', icon: History },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart2 },
  ];

  return (
    <aside
      className={cn(
        'relative flex flex-col transition-all duration-200 select-none z-30 shrink-0 border-r border-white/5',
        'bg-gradient-to-b from-[#251A48] via-[#1A1236] to-[#120C27] text-white',
        isCollapsed ? 'w-16 p-2' : 'w-[260px] p-4'
      )}
    >
      {/* Brand Header / Workspace Card */}
      <div className="mb-5">
        <NavLink
          to="/"
          className={cn(
            'flex items-center transition-all',
            isCollapsed
              ? 'justify-center py-2.5 px-1'
              : 'bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 rounded-2xl px-3.5 py-3 shadow-xs'
          )}
        >
          <VacLogo
            size={isCollapsed ? 'xs' : 'sm'}
            showSubtitle={!isCollapsed}
            variant="light"
          />
        </NavLink>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto space-y-5 pr-1 scrollbar-none">
        {/* WORKSPACE Section */}
        <div>
          {!isCollapsed && (
            <div className="px-3 pb-1.5 text-[10px] font-bold text-[#7C7299] uppercase tracking-widest">
              Workspace
            </div>
          )}
          <nav className="space-y-0.5">
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
                    'flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all',
                    isActive
                      ? 'bg-[#3A2968]/80 border border-purple-500/30 text-white shadow-sm'
                      : 'text-purple-200/70 hover:text-white hover:bg-white/[0.04]',
                    isCollapsed && 'justify-center px-0'
                  )}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-purple-300' : 'text-purple-300/60')} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!isCollapsed && item.badge && (
                    <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-[#43355F] text-amber-200">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* ADMIN STUDIO Section */}
        {isAdmin && (
          <div>
            {!isCollapsed && (
              <div className="px-3 pb-1.5 text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                <Shield className="w-3 h-3" />
                Configure
              </div>
            )}
            <nav className="space-y-0.5">
              {adminNav.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === '/admin'
                    ? location.pathname === '/admin'
                    : location.pathname.startsWith(item.href);

                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    title={isCollapsed ? item.label : undefined}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all',
                      isActive
                        ? 'bg-[#3A2968]/80 text-white border border-amber-500/30'
                        : 'text-purple-200/70 hover:text-white hover:bg-white/[0.04]',
                      isCollapsed && 'justify-center px-0'
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-amber-400/80" />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Bottom Footer Section: Active Engine Status & Profile */}
      <div className="pt-3 space-y-3 border-t border-white/5">
        {!isCollapsed && (
          <div className="bg-[#1C143B]/80 border border-purple-500/20 rounded-2xl p-2.5 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex -space-x-1.5">
                <span className="w-5 h-5 rounded-full bg-purple-600 border border-[#1C143B] flex items-center justify-center text-[9px] text-white">
                  <Wrench className="w-2.5 h-2.5" />
                </span>
                <span className="w-5 h-5 rounded-full bg-indigo-500 border border-[#1C143B] flex items-center justify-center text-[9px] text-white">
                  <Bot className="w-2.5 h-2.5" />
                </span>
                <span className="w-5 h-5 rounded-full bg-pink-500 border border-[#1C143B] flex items-center justify-center text-[9px] text-white">
                  <Sparkles className="w-2.5 h-2.5" />
                </span>
                <span className="w-5 h-5 rounded-full bg-violet-400 border border-[#1C143B] flex items-center justify-center text-[9px] text-white">
                  <Globe className="w-2.5 h-2.5" />
                </span>
              </div>
              <span className="text-[11px] font-semibold text-white">CLI Registry Live</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-purple-300/60 pl-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Synced with registry v1.0.0</span>
            </div>
          </div>
        )}

        {/* Profile Card */}
        {user ? (
          <div className="flex items-center justify-between px-1.5 py-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              {!isCollapsed && (
                <div className="truncate">
                  <h4 className="text-xs font-semibold text-white leading-tight truncate">{user.name}</h4>
                  <p className="text-[10px] text-purple-300/60 leading-tight uppercase font-mono">{user.role}</p>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <button className="text-purple-300/60 hover:text-white p-1">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : null}

        {/* Collapse Control */}
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-2 rounded-xl text-purple-300/60 hover:text-white hover:bg-white/[0.04] transition-all text-xs gap-2"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-[11px]">Collapse sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
