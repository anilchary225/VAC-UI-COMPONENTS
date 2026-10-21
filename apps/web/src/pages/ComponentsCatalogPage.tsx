import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Layers,
  ArrowRight,
  Terminal,
  Check,
  Copy,
  Sparkles,
} from 'lucide-react';
import { api } from '../lib/api';
import { ComponentSummary, Category } from '@vac/shared';
import { Button } from '../components/ui/Button';

export const ComponentsCatalogPage: React.FC = () => {
  const [components, setComponents] = useState<ComponentSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('downloads');
  const [isLoading, setIsLoading] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.getCategories().catch(() => []),
      api.getComponents({ search: searchQuery, category: selectedCategory, sort: sortBy }),
    ])
      .then(([cats, comps]) => {
        if (cats.length > 0) setCategories(cats);
        setComponents(comps);
      })
      .catch((err) => console.warn('Catalog fetch error:', err))
      .finally(() => setIsLoading(false));
  }, [selectedCategory, searchQuery, sortBy]);

  const copyCliCommand = (slug: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`npx vac-ui-components add ${slug}`);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Component Catalog
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Explore accessible, customizable React components ready for quick CLI integration.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pb-4 border-b border-[#E7E9F0] dark:border-white/10">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, tag, or keyword..."
            className="w-full h-9 pl-9 pr-4 rounded-btn border border-[#E7E9F0] dark:border-white/10 bg-white dark:bg-[#11131A] text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 px-3 rounded-btn border border-[#E7E9F0] dark:border-white/10 bg-white dark:bg-[#11131A] text-xs text-gray-800 dark:text-gray-200 focus:outline-none"
          >
            <option value="downloads">Most Downloaded</option>
            <option value="favorites">Most Favorited</option>
            <option value="newest">Recently Published</option>
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-btn text-xs font-medium whitespace-nowrap transition-colors ${
            selectedCategory === 'all'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.04]'
          }`}
        >
          All Components
        </button>
        {categories
          .filter((c) => c.slug !== 'all')
          .map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3 py-1.5 rounded-btn text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.name
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.04]'
              }`}
            >
              {cat.name}
            </button>
          ))}
      </div>

      {/* Component Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-56 rounded-panel bg-gray-100 dark:bg-[#11131A] animate-pulse border border-[#E7E9F0] dark:border-white/5"
            />
          ))}
        </div>
      ) : components.length === 0 ? (
        <div className="text-center py-16 rounded-panel border border-dashed border-[#E7E9F0] dark:border-white/10 p-8">
          <Layers className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">No components found</h3>
          <p className="text-xs text-gray-400 mt-1">Try adjusting your search or category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {components.map((comp) => (
            <Link
              key={comp.slug}
              to={`/components/${comp.slug}`}
              className="group flex flex-col justify-between rounded-panel border border-[#E7E9F0] dark:border-white/10 bg-white dark:bg-[#11131A] p-5 hover:border-indigo-500/40 hover:shadow-lg dark:hover:shadow-indigo-500/5 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded">
                    {comp.category}
                  </span>
                  <span className="text-[11px] font-mono text-gray-400">
                    v{comp.currentVersion}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                  {comp.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {comp.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {comp.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/[0.04] text-gray-600 dark:text-gray-400"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer: Quick copy CLI & Details link */}
              <div className="mt-5 pt-3.5 border-t border-[#E7E9F0] dark:border-white/10 flex items-center justify-between text-xs">
                <button
                  onClick={(e) => copyCliCommand(comp.slug, e)}
                  title="Copy CLI install command"
                  className="flex items-center gap-1.5 font-mono text-[11px] text-gray-500 hover:text-indigo-500 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  {copiedSlug === comp.slug ? (
                    <span className="text-emerald-500 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Copied!
                    </span>
                  ) : (
                    <span>vac-ui add {comp.slug}</span>
                  )}
                </button>

                <span className="text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Preview <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
