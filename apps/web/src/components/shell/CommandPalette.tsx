import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Layers, Compass, Bookmark, Shield, BookOpen, ExternalLink, X } from 'lucide-react';

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
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-xl bg-white dark:bg-[#11131A] border border-[#E7E9F0] dark:border-white/10 rounded-panel shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#E7E9F0] dark:border-white/10 gap-3">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search components, documentation, actions..."
            className="w-full bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
          />
          <button 
            onClick={onClose}
            className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">
              No results found for "{query}".
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={() => handleSelect(item.href)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-btn text-left text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 group-hover:text-indigo-500 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{item.name}</span>
                  </div>
                  <span className="text-[11px] font-mono text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-white/[0.04] px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-[#E7E9F0] dark:border-white/10 bg-gray-50 dark:bg-[#0E1016] flex items-center justify-between text-[11px] text-gray-400 font-mono">
          <span>Navigate with <kbd className="px-1 py-0.5 rounded bg-gray-200 dark:bg-white/10">↑</kbd> <kbd className="px-1 py-0.5 rounded bg-gray-200 dark:bg-white/10">↓</kbd></span>
          <span>Select with <kbd className="px-1 py-0.5 rounded bg-gray-200 dark:bg-white/10">↵</kbd></span>
        </div>
      </div>
    </div>
  );
};
