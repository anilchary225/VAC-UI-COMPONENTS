import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RecentlyViewedPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#161722] dark:text-white">
          Recently Viewed
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Components you have inspected and previewed during your session.
        </p>
      </div>

      <div className="text-center py-16 rounded-2xl border border-dashed border-[#E8EAEF] dark:border-white/10 p-8 bg-white dark:bg-[#11131A]">
        <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-[#161722] dark:text-white">History empty</h3>
        <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto mb-4">
          Visited components will be recorded here for seamless resumption.
        </p>
        <Link to="/components">
          <button className="px-4 py-2 rounded-full border border-gray-200 dark:border-white/10 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 inline-flex items-center gap-1.5 transition-all">
            Explore Catalog <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </Link>
      </div>
    </div>
  );
};
