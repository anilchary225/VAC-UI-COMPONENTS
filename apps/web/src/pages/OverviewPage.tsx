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
  Zap,
  Package,
} from 'lucide-react';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      {/* Welcome Banner with Twilight Gradient */}
      <div className="relative rounded-3xl overflow-hidden border border-purple-500/20 bg-gradient-to-r from-[#291A57] via-[#211545] to-[#170E33] p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-mono mb-4">
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>VAC-UI-COMPONENTS · Developer Platform v1.0.0</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
            Minimal, production-ready React components.
          </h1>
          <p className="text-xs sm:text-sm text-purple-100/80 leading-relaxed mb-6 font-normal">
            Explore curated UI components built with React, TypeScript, and Motion.
            Directly copy source files or install in seconds using the verified VAC CLI.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/components">
              <button className="px-5 py-2.5 rounded-full bg-[#5B4FF5] hover:bg-[#4F46E5] text-white text-xs font-semibold shadow-md shadow-indigo-900/40 transition-all flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Browse Catalog
              </button>
            </Link>

            {/* Quick Install snippet */}
            <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-full px-4 py-2 font-mono text-xs text-gray-300">
              <Terminal className="w-3.5 h-3.5 text-purple-300 shrink-0" />
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl border border-[#E8EAEF] dark:border-white/10 bg-white dark:bg-[#11131A] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#7C7299]">Official Catalog</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-white/5 flex items-center justify-center text-[#5B4FF5]">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-[#161722] dark:text-white mt-3">
              {components.length || 6}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Curated components ready for production
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[#E8EAEF] dark:border-white/10 bg-white dark:bg-[#11131A] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#7C7299]">Total Installs</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-white/5 flex items-center justify-center text-[#10B981]">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-[#161722] dark:text-white mt-3">
              6,390+
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              CLI additions across verified projects
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[#E8EAEF] dark:border-white/10 bg-white dark:bg-[#11131A] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#7C7299]">Registry Status</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-white/5 flex items-center justify-center text-[#F59E0B]">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-[#161722] dark:text-white mt-3">
              100% Immutable
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Semver releases & integrity verification
            </p>
          </div>
        </div>
      </div>

      {/* Featured Components Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#161722] dark:text-white">
              Official Components
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Tested for accessibility, performance, and dark/light modes.
            </p>
          </div>
          <Link
            to="/components"
            className="text-xs font-medium text-[#5B4FF5] hover:underline flex items-center gap-1"
          >
            View all components <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-44 rounded-2xl bg-gray-100 dark:bg-[#11131A] animate-pulse border border-gray-200 dark:border-white/5"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {components.slice(0, 6).map((comp) => (
              <div
                key={comp.slug}
                className="group p-5 rounded-2xl border border-[#E8EAEF] dark:border-white/10 bg-white dark:bg-[#11131A] hover:border-[#5B4FF5]/50 hover:shadow-lg dark:hover:shadow-purple-500/5 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#5B4FF5] bg-[#5B4FF5]/10 px-2.5 py-0.5 rounded-full font-medium">
                      {comp.category}
                    </span>
                    <span className="text-[11px] font-mono text-gray-400">
                      v{comp.currentVersion}
                    </span>
                  </div>
                  <h3 className="font-bold text-[#161722] dark:text-white text-base group-hover:text-[#5B4FF5] transition-colors">
                    {comp.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {comp.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[#E8EAEF] dark:border-white/10 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {comp.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <Link
                    to={`/components/${comp.slug}`}
                    className="text-xs font-semibold text-[#181A25] dark:text-white group-hover:text-[#5B4FF5] group-hover:translate-x-0.5 transition-all inline-flex items-center gap-1"
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
