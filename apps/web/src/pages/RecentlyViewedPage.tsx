import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const RecentlyViewedPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Recently Viewed
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Components you have inspected and previewed during your session.
        </p>
      </div>

      <div className="text-center py-16 rounded-panel border border-dashed border-[#E7E9F0] dark:border-white/10 p-8">
        <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">History empty</h3>
        <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto mb-4">
          Visited components will be recorded here for seamless resumption.
        </p>
        <Link to="/components">
          <Button variant="secondary" size="sm" className="gap-1.5">
            Explore Catalog <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
};
