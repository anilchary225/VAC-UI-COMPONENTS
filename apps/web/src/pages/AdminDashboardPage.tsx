import React, { useState } from 'react';
import {
  Shield,
  Layers,
  Users,
  PackageCheck,
  BarChart2,
  Terminal,
  Check,
  Copy,
  Plus,
  Eye,
  Search,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../features/auth/authStore';

interface AdminComponentItem {
  id: string;
  name: string;
  category: string;
  version: string;
  status: 'published' | 'draft' | 'validation';
  downloads: string;
  updatedAt: string;
  cliCommand: string;
}

const ADMIN_COMPONENTS: AdminComponentItem[] = [
  {
    id: 'comp_1',
    name: 'Animated Login Form',
    category: 'Forms & Authentication',
    version: '1.0.0',
    status: 'published',
    downloads: '1.4k',
    updatedAt: '2 days ago',
    cliCommand: 'npx vac-ui-components add animated-login-form',
  },
  {
    id: 'comp_2',
    name: 'Glassmorphism Navbar',
    category: 'Navigation',
    version: '1.0.0',
    status: 'published',
    downloads: '980',
    updatedAt: '3 days ago',
    cliCommand: 'npx vac-ui-components add glassmorphism-navbar',
  },
  {
    id: 'comp_3',
    name: 'Interactive Pricing Tier',
    category: 'Marketing & Sales',
    version: '1.0.0',
    status: 'published',
    downloads: '870',
    updatedAt: '4 days ago',
    cliCommand: 'npx vac-ui-components add interactive-pricing',
  },
  {
    id: 'comp_4',
    name: 'Analytics Metrics Matrix',
    category: 'Data & Dashboards',
    version: '1.0.0',
    status: 'published',
    downloads: '1.2k',
    updatedAt: '5 days ago',
    cliCommand: 'npx vac-ui-components add analytics-dashboard',
  },
  {
    id: 'comp_5',
    name: 'Notification Center Feed',
    category: 'Feedback & Overlays',
    version: '1.0.0',
    status: 'published',
    downloads: '760',
    updatedAt: '1 week ago',
    cliCommand: 'npx vac-ui-components add notification-center',
  },
  {
    id: 'comp_6',
    name: 'Drag & Drop File Upload',
    category: 'Forms & Authentication',
    version: '1.0.0',
    status: 'published',
    downloads: '1.1k',
    updatedAt: '1 week ago',
    cliCommand: 'npx vac-ui-components add file-upload',
  },
  {
    id: 'comp_7',
    name: 'Glass Pill Button',
    category: 'Buttons & Controls',
    version: '1.0.0',
    status: 'published',
    downloads: '640',
    updatedAt: '1 week ago',
    cliCommand: 'npx vac-ui-components add glass-button',
  },
  {
    id: 'comp_8',
    name: 'Animated Toggle Switch',
    category: 'Buttons & Controls',
    version: '1.0.0',
    status: 'published',
    downloads: '920',
    updatedAt: '1 week ago',
    cliCommand: 'npx vac-ui-components add toggle-switch',
  },
  {
    id: 'comp_9',
    name: 'Spotlight Ambient Card',
    category: 'Cards & Surfaces',
    version: '1.0.0',
    status: 'published',
    downloads: '810',
    updatedAt: '2 weeks ago',
    cliCommand: 'npx vac-ui-components add dark-glass-card',
  },
];

export const AdminDashboardPage: React.FC = () => {
  const { user, login, openAuthModal } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState('');

  const copyCli = (command: string, id: string) => {
    navigator.clipboard.writeText(command);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDemoAdminSignIn = async () => {
    try {
      await login('admin@vac.dev', 'AdminPass123!');
    } catch {
      openAuthModal('login');
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-2">
          <Shield className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-[#161722] dark:text-white">
          Administrator Access Required
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 mb-6 leading-relaxed">
          The Component Studio and catalog release management are restricted to verified administrators.
          Sign in with an administrative account or click below to authenticate with the pre-configured admin profile.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleDemoAdminSignIn}
            className="px-5 py-2.5 rounded-full bg-[#5B4FF5] hover:bg-[#4F46E5] text-white text-xs font-semibold shadow-md transition-all flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Sign In as Demo Admin
          </button>
          <button
            onClick={() => openAuthModal('login')}
            className="px-5 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 text-gray-800 dark:text-white text-xs font-semibold transition-all"
          >
            Custom Sign In
          </button>
        </div>
      </div>
    );
  }

  const filtered = ADMIN_COMPONENTS.filter((c) =>
    c.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-2">
            <Shield className="w-3 h-3" />
            Admin Studio Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#161722] dark:text-white">
            Catalog & Release Management
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Review drafts, manage component versions, validate source schemas, and publish official catalog releases.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button className="px-4 py-2 rounded-full bg-[#5B4FF5] hover:bg-[#4F46E5] text-white text-xs font-medium flex items-center gap-1.5 shadow-md transition-all">
            <Plus className="w-3.5 h-3.5" />
            <span>Create Component</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl border border-[#E8EAEF] dark:border-white/10 bg-white dark:bg-[#11131A] shadow-xs transition-colors">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Published Components</span>
            <Layers className="w-4 h-4 text-[#5B4FF5]" />
          </div>
          <p className="text-2xl font-bold text-[#161722] dark:text-white mt-2">
            {ADMIN_COMPONENTS.length}
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-[#E8EAEF] dark:border-white/10 bg-white dark:bg-[#11131A] shadow-xs transition-colors">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Pending Validation</span>
            <PackageCheck className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-[#161722] dark:text-white mt-2">0</p>
        </div>

        <div className="p-5 rounded-2xl border border-[#E8EAEF] dark:border-white/10 bg-white dark:bg-[#11131A] shadow-xs transition-colors">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Registered Developers</span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-[#161722] dark:text-white mt-2">24</p>
        </div>

        <div className="p-5 rounded-2xl border border-[#E8EAEF] dark:border-white/10 bg-white dark:bg-[#11131A] shadow-xs transition-colors">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Registry Status</span>
            <BarChart2 className="w-4 h-4 text-cyan-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-500 mt-2">Active</p>
        </div>
      </div>

      {/* Components List Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#161722] dark:text-white">
              Available Components Catalog
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              List of all components deployed to the public registry.
            </p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter catalog..."
              className="bg-white dark:bg-[#11131A] border border-[#E8EAEF] dark:border-white/10 text-xs rounded-full pl-8 pr-4 py-1.5 focus:outline-none focus:border-[#5B4FF5] text-[#161722] dark:text-white w-56 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Table of Components */}
        <div className="rounded-2xl border border-[#E8EAEF] dark:border-white/10 bg-white dark:bg-[#11131A] overflow-hidden shadow-xs transition-colors">
          <div className="grid grid-cols-12 gap-3 px-5 py-3.5 bg-gray-50/70 dark:bg-white/[0.02] border-b border-[#E8EAEF] dark:border-white/10 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            <div className="col-span-4">Component Name</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Version / Status</div>
            <div className="col-span-3">CLI Package Command</div>
            <div className="col-span-1 text-right">Action</div>
          </div>

          <div className="divide-y divide-[#E8EAEF] dark:divide-white/[0.05]">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-3 px-5 py-3.5 items-center text-xs hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-colors"
              >
                <div className="col-span-4 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-[#5B4FF5] flex items-center justify-center shrink-0 border border-purple-200/50 dark:border-purple-500/20">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#161722] dark:text-white">
                      {item.name}
                    </h4>
                    <span className="text-[10px] text-gray-400">Updated {item.updatedAt}</span>
                  </div>
                </div>

                <div className="col-span-2 text-gray-600 dark:text-gray-300">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200/50 dark:border-white/5">
                    {item.category}
                  </span>
                </div>

                <div className="col-span-2 flex items-center gap-2">
                  <span className="font-mono text-[11px] text-gray-500">v{item.version}</span>
                  <span className="text-[10px] font-medium px-2 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    {item.status}
                  </span>
                </div>

                <div className="col-span-3">
                  <button
                    onClick={() => copyCli(item.cliCommand, item.id)}
                    className="font-mono text-[11px] bg-gray-100 dark:bg-black/40 hover:bg-gray-200 dark:hover:bg-black/60 px-2.5 py-1.5 rounded-xl text-gray-700 dark:text-gray-300 flex items-center justify-between w-full transition-colors border border-gray-200/60 dark:border-white/10"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <Terminal className="w-3 h-3 text-[#5B4FF5] shrink-0" />
                      <span className="truncate">{item.cliCommand}</span>
                    </div>
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 ml-1.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-gray-400 shrink-0 ml-1.5" />
                    )}
                  </button>
                </div>

                <div className="col-span-1 text-right">
                  <a
                    href="/components"
                    className="text-[#5B4FF5] hover:underline font-semibold text-xs inline-flex items-center gap-0.5"
                  >
                    View <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

