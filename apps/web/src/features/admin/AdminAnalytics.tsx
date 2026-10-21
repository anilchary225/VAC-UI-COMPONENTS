import React, { useState, useEffect } from 'react';
import { BarChart3, Layers, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { api } from '../../lib/api';

export const AdminAnalytics: React.FC = () => {
  const [data, setData] = useState<{
    categoryDistribution: Array<{ category: string; count: number }>;
    statusDistribution: Array<{ status: string; count: number }>;
    totalReleases: number;
    recentReleases: Array<{ componentSlug: string; version: string; publishedAt: string }>;
  } | null>(null);

  useEffect(() => {
    api.getAdminAnalytics().then(setData).catch(console.error);
  }, []);

  if (!data) {
    return <div className="p-12 text-center text-xs text-gray-400">Loading catalog analytics...</div>;
  }

  const maxCategoryCount = Math.max(...data.categoryDistribution.map((c) => c.count), 1);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold text-[#161722] dark:text-white flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#5B4FF5]" />
          Catalog Metrics & Distribution
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Genuine aggregate distribution derived directly from registered database and version releases.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#11131A] border border-[#E8EAEF] dark:border-white/10 space-y-5">
          <h3 className="text-sm font-bold text-[#161722] dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#5B4FF5]" />
            Components by Vocabulary Category
          </h3>

          <div className="space-y-3.5">
            {data.categoryDistribution.map((item) => {
              const pct = Math.round((item.count / maxCategoryCount) * 100);
              return (
                <div key={item.category} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between text-gray-700 dark:text-gray-300">
                    <span className="font-medium">{item.category}</span>
                    <span className="font-mono text-gray-400">{item.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#5B4FF5] transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#11131A] border border-[#E8EAEF] dark:border-white/10 space-y-5">
          <h3 className="text-sm font-bold text-[#161722] dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Component Lifecycle Status
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {data.statusDistribution.map((st) => (
              <div
                key={st.status}
                className="p-4 rounded-2xl bg-gray-50/70 dark:bg-white/[0.02] border border-[#E8EAEF] dark:border-white/10"
              >
                <span className="text-[10px] uppercase font-semibold text-gray-400">
                  {st.status}
                </span>
                <p className="text-2xl font-bold text-[#161722] dark:text-white mt-1">
                  {st.count}
                </p>
              </div>
            ))}
          </div>

          {/* Recent Releases List */}
          <div className="pt-4 border-t border-[#E8EAEF] dark:border-white/10 space-y-3">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Recent Version Cuts ({data.totalReleases} Total)
            </h4>
            <div className="divide-y divide-[#E8EAEF] dark:divide-white/5">
              {data.recentReleases.map((rel, i) => (
                <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                  <span className="font-mono text-[#5B4FF5]">{rel.componentSlug}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-gray-100 dark:bg-white/5 text-gray-300">
                      v{rel.version}
                    </span>
                    <span className="text-gray-400 text-[10px]">
                      {rel.publishedAt ? new Date(rel.publishedAt).toLocaleDateString() : 'Active'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
