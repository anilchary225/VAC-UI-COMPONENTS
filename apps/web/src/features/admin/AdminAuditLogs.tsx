import React, { useState, useEffect } from 'react';
import { Shield, Filter, Search, ChevronLeft, ChevronRight, Clock, User } from 'lucide-react';
import { api } from '../../lib/api';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [resourceTypeFilter, setResourceTypeFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAdminAuditLogs({
        action: actionFilter || undefined,
        resourceType: resourceTypeFilter || undefined,
        page,
        limit: 20,
      });
      setLogs(res.logs);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, resourceTypeFilter, page]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#161722] dark:text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            Security & Administration Audit Trail
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Immutable log of all administrative actions, draft updates, and release events.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="bg-white dark:bg-[#11131A] border border-[#E8EAEF] dark:border-white/10 text-xs rounded-2xl px-3 py-1.5 text-[#161722] dark:text-white focus:outline-none"
          >
            <option value="">All Actions</option>
            <option value="component.create">component.create</option>
            <option value="component.update_draft">component.update_draft</option>
            <option value="component.validate">component.validate</option>
            <option value="component.publish">component.publish</option>
            <option value="component.deprecate">component.deprecate</option>
            <option value="category.create">category.create</option>
          </select>

          <select
            value={resourceTypeFilter}
            onChange={(e) => {
              setResourceTypeFilter(e.target.value);
              setPage(1);
            }}
            className="bg-white dark:bg-[#11131A] border border-[#E8EAEF] dark:border-white/10 text-xs rounded-2xl px-3 py-1.5 text-[#161722] dark:text-white focus:outline-none"
          >
            <option value="">All Resources</option>
            <option value="component">Component</option>
            <option value="version">Version</option>
            <option value="category">Category</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-3xl border border-[#E8EAEF] dark:border-white/10 bg-white dark:bg-[#11131A] overflow-x-auto shadow-xs">
        <div className="min-w-[650px]">
          <div className="grid grid-cols-12 gap-3 px-6 py-3.5 bg-gray-50/70 dark:bg-white/[0.02] border-b border-[#E8EAEF] dark:border-white/10 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          <div className="col-span-3">Timestamp</div>
          <div className="col-span-3">Actor</div>
          <div className="col-span-3">Action / Resource</div>
          <div className="col-span-3 text-right">Details Payload</div>
        </div>

        <div className="divide-y divide-[#E8EAEF] dark:divide-white/[0.05]">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-gray-400">Loading audit trail...</div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-400">No audit events found.</div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="grid grid-cols-12 gap-3 px-6 py-3.5 items-center text-xs hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-colors"
              >
                <div className="col-span-3 text-gray-400 font-mono text-[11px] flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span>{new Date(log.createdAt).toLocaleString()}</span>
                </div>

                <div className="col-span-3">
                  <div className="font-semibold text-[#161722] dark:text-white flex items-center gap-1.5">
                    <User className="w-3 h-3 text-[#5B4FF5]" />
                    <span>{log.actorName}</span>
                  </div>
                  <span className="text-[10px] text-gray-400">{log.actorEmail}</span>
                </div>

                <div className="col-span-3 space-y-0.5">
                  <span className="inline-block font-mono text-[11px] px-2 py-0.5 rounded bg-purple-500/10 text-[#5B4FF5] border border-purple-500/20">
                    {log.action}
                  </span>
                  <div className="text-[10px] text-gray-400 font-mono">
                    {log.resourceType}: {log.resourceId}
                  </div>
                </div>

                <div className="col-span-3 text-right">
                  <span className="font-mono text-[10px] bg-gray-100 dark:bg-black/40 px-2 py-1 rounded text-gray-600 dark:text-gray-300 inline-block max-w-[200px] truncate">
                    {JSON.stringify(log.details)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-[#E8EAEF] dark:border-white/10 flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing {logs.length} of {total} events
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
