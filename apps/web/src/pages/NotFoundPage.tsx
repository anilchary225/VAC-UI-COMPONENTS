import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <h1 className="text-6xl font-bold font-mono text-indigo-500 mb-2">404</h1>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        Page Not Found
      </h2>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
        The component or route you are looking for does not exist or has been relocated.
      </p>
      <Link to="/">
        <Button variant="primary" size="sm" className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Return to Overview
        </Button>
      </Link>
    </div>
  );
};
