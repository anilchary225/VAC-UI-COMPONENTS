import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Layers, Compass, Bookmark, Shield, X } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickActions = [
    { name: 'Animated Login Form', category: 'Component', icon: Layers, href: '/components/animated-login-form' },
    { name: 'Glassmorphism Navbar', category: 'Component', icon: Layers, href: '/components/glassmorphism-navbar' },
    { name: 'Interactive Pricing', category: 'Component', icon: Layers, href: '/components/interactive-pricing' },
    { name: 'Analytics Dashboard', category: 'Component', icon: Layers, href: '/components/analytics-dashboard' },
    { name: 'Notification Center', category: 'Component', icon: Layers, href: '/components/notification-center' },
    { name: 'File Upload Dropzone', category: 'Component', icon: Layers, href: '/components/file-upload' },
    { name: 'Component Catalog', category: 'Navigation', icon: Compass, href: '/components' },
    { name: 'My Favorites', category: 'Navigation', icon: Bookmark, href: '/favorites' },
    { name: 'Admin Studio', category: 'Admin', icon: Shield, href: '/admin' },
  ];

  const filtered = quickActions.filter((a) =>
    a.name.toLowerCase().includes(query.toLowerCase()) || a.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (href: string) => {
    navigate(href);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-20 px-3 sm:px-4 bg-black/60 backdrop-blur-xs animate-fade-in"
    >
      <div 
        className="w-full max-w-xl bg-white dark:bg-[#11131A] border border-gray-200/90 dark:border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-gray-100 dark:border-white/10 gap-3">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search components, documentation, actions..."
            className="w-full bg-transparent text-sm text-[#161722] dark:text-white placeholder-gray-400 focus:outline-none"
          />
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 shrink-0"
            aria-label="Close command palette"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 sm:p-2.5 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">
              No results found for "{query}".
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={() => handleSelect(item.href)}
                  className="w-full flex items-center justify-between px-3 sm:px-3.5 py-2.5 rounded-2xl text-left text-xs text-gray-800 dark:text-gray-200 hover:bg-[#F5F6FA] dark:hover:bg-white/[0.06] transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 truncate">
                    <div className="p-2 rounded-xl bg-purple-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 group-hover:text-[#5B4FF5] transition-colors shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-[#161722] dark:text-white truncate">{item.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#5B4FF5] bg-[#5B4FF5]/10 px-2 py-0.5 rounded-full shrink-0 ml-2">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="hidden sm:flex px-4 py-2.5 border-t border-gray-100 dark:border-white/10 bg-[#F5F6FA] dark:bg-[#0E1016] items-center justify-between text-[11px] text-gray-400 font-mono">
          <span>Navigate with <kbd className="px-1.5 py-0.5 rounded-full bg-white dark:bg-white/10 border border-gray-200 dark:border-transparent text-gray-700 dark:text-gray-300">↑</kbd> <kbd className="px-1.5 py-0.5 rounded-full bg-white dark:bg-white/10 border border-gray-200 dark:border-transparent text-gray-700 dark:text-gray-300">↓</kbd></span>
          <span>Select with <kbd className="px-1.5 py-0.5 rounded-full bg-white dark:bg-white/10 border border-gray-200 dark:border-transparent text-gray-700 dark:text-gray-300">↵</kbd></span>
        </div>
      </div>
    </div>
  );
};
