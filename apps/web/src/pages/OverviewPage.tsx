import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Terminal,
  Check,
  Copy,
  Layers,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Zap,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { api } from '../lib/api';
import { ComponentSummary } from '@vac/shared';

export const OverviewPage: React.FC = () => {
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [components, setComponents] = useState<ComponentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const installCommand = 'npx vac-ui-components add animated-login-form';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(installCommand);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  useEffect(() => {
    api
      .getComponents()
      .then((data) => setComponents(data))
      .catch((err) => console.warn('Failed to fetch components overview:', err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="relative rounded-preview overflow-hidden border border-[#E7E9F0] dark:border-white/10 bg-gradient-to-r from-gray-900 via-[#11131A] to-[#171A23] p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            VAC-UI-COMPONENTS Developer Platform v1.0.0
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
            Minimal, production-ready React components.
          </h1>
          <p className="text-sm text-gray-300 leading-relaxed mb-6">
            Explore carefully crafted UI components built with React, TypeScript, and Motion.
            Directly copy source files or install in seconds with the verified VAC CLI.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/components">
              <Button size="md" variant="primary" className="gap-2">
                <Layers className="w-4 h-4" />
                Browse Catalog
              </Button>
            </Link>

            {/* Quick Install snippet */}
            <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-btn px-3 py-1.5 font-mono text-xs text-gray-300">
              <Terminal className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>{installCommand}</span>
              <button
                onClick={copyToClipboard}
                title="Copy installation command"
                className="ml-2 text-gray-400 hover:text-white transition-colors"
              >
                {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-panel border border-[#E7E9F0] dark:border-white/10 bg-white dark:bg-[#11131A]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Official Catalog</span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {components.length || 6}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Curated components ready for production
          </p>
        </div>

        <div className="p-5 rounded-panel border border-[#E7E9F0] dark:border-white/10 bg-white dark:bg-[#11131A]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Downloads</span>
            <Zap className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            6,390+
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            CLI additions across verified projects
          </p>
        </div>

        <div className="p-5 rounded-panel border border-[#E7E9F0] dark:border-white/10 bg-white dark:bg-[#11131A]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">CLI & Registry</span>
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            100% Immutable
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Semver versioning & integrity verification
          </p>
        </div>
      </div>

      {/* Featured Components Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Official Components
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Tested for accessibility, performance, and dark/light modes.
            </p>
          </div>
          <Link
            to="/components"
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            View all components <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-44 rounded-panel bg-gray-100 dark:bg-[#11131A] animate-pulse border border-[#E7E9F0] dark:border-white/5"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {components.slice(0, 6).map((comp) => (
              <div
                key={comp.slug}
                className="group p-5 rounded-panel border border-[#E7E9F0] dark:border-white/10 bg-white dark:bg-[#11131A] hover:border-indigo-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded">
                      {comp.category}
                    </span>
                    <span className="text-[11px] font-mono text-gray-400">
                      v{comp.currentVersion}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-base group-hover:text-indigo-500 transition-colors">
                    {comp.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {comp.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[#E7E9F0] dark:border-white/10 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {comp.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <Link
                    to={`/components/${comp.slug}`}
                    className="text-xs font-medium text-gray-900 dark:text-white group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1"
                  >
                    Details <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
