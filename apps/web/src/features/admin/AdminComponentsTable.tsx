import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Layers,
  FileCode,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Plus,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../lib/api';
import { CATEGORY_OPTIONS } from './ComponentStudio';

interface AdminComponentsTableProps {
  onOpenStudio: (slugOrId: string) => void;
  onCreateNew: () => void;
}

export const AdminComponentsTable: React.FC<AdminComponentsTableProps> = ({
  onOpenStudio,
  onCreateNew,
}) => {
  const [components, setComponents] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const fetchComponents = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAdminComponents({
        search,
        category,
        status,
        page,
        limit: 15,
      });
      setComponents(res.components);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      console.error('Failed to query components:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComponents();
  }, [search, category, status, page]);

  return (
    <div className="space-y-5">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Filter by name, slug, or tag..."
              className="bg-white dark:bg-[#11131A] border border-[#E8EAEF] dark:border-white/10 text-xs rounded-2xl pl-8 pr-4 py-2 focus:outline-none focus:border-[#5B4FF5] text-[#161722] dark:text-white w-64 placeholder-gray-400"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="bg-white dark:bg-[#11131A] border border-[#E8EAEF] dark:border-white/10 text-xs rounded-2xl px-3 py-2 text-[#161722] dark:text-white focus:outline-none focus:border-[#5B4FF5]"
          >
            <option value="all">All Categories</option>
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="bg-white dark:bg-[#11131A] border border-[#E8EAEF] dark:border-white/10 text-xs rounded-2xl px-3 py-2 text-[#161722] dark:text-white focus:outline-none focus:border-[#5B4FF5]"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="validating">Validating</option>
            <option value="deprecated">Deprecated</option>
          </select>
        </div>

        <button
          onClick={onCreateNew}
          className="px-4 py-2 rounded-2xl bg-[#5B4FF5] hover:bg-[#4F46E5] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Component</span>
        </button>
      </div>

      {/* Components Table */}
      <div className="rounded-3xl border border-[#E8EAEF] dark:border-white/10 bg-white dark:bg-[#11131A] overflow-hidden shadow-xs">
        <div className="grid grid-cols-12 gap-3 px-6 py-3.5 bg-gray-50/70 dark:bg-white/[0.02] border-b border-[#E8EAEF] dark:border-white/10 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          <div className="col-span-5">Component</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-2">Version / Status</div>
          <div className="col-span-2">Last Updated</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        <div className="divide-y divide-[#E8EAEF] dark:divide-white/[0.05]">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-gray-400">Loading catalog items...</div>
          ) : components.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-400">
              No components match the selected query.
            </div>
          ) : (
            components.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-3 px-6 py-4 items-center text-xs hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-colors"
              >
                {/* Name & Slug */}
                <div className="col-span-5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-[#5B4FF5] flex items-center justify-center shrink-0 border border-purple-200/50 dark:border-purple-500/20">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#161722] dark:text-white">
                      {item.name}
                    </h4>
                    <span className="font-mono text-[10px] text-gray-400">
                      {item.slug}
                    </span>
                  </div>
                </div>

                {/* Category */}
                <div className="col-span-2 text-gray-600 dark:text-gray-300">
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200/50 dark:border-white/5">
                    {item.category}
                  </span>
                </div>

                {/* Version & Status */}
                <div className="col-span-2 flex items-center gap-2">
                  <span className="font-mono text-[11px] text-gray-500">v{item.currentVersion}</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      item.status === 'published'
                        ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                        : item.status === 'deprecated'
                        ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400'
                        : 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                {/* Last Updated */}
                <div className="col-span-2 text-gray-400 text-[11px]">
                  {new Date(item.updatedAt).toLocaleDateString()}
                </div>

                {/* Actions */}
                <div className="col-span-1 text-right flex items-center justify-end gap-2">
                  <button
                    onClick={() => onOpenStudio(item.slug)}
                    className="text-[#5B4FF5] hover:text-[#4F46E5] font-semibold text-xs flex items-center gap-1"
                  >
                    <span>Studio</span>
                  </button>
                  {item.status === 'published' && (
                    <a
                      href={`/components/${item.slug}`}
                      className="text-gray-400 hover:text-white"
                      title="View in Catalog"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-[#E8EAEF] dark:border-white/10 flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing {components.length} of {total} components
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-lg border border-[#E8EAEF] dark:border-white/10 disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px]">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-lg border border-[#E8EAEF] dark:border-white/10 disabled:opacity-40"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
