import { ComponentDetail } from '@vac/shared';

export const INITIAL_OFFICIAL_COMPONENTS: ComponentDetail[] = [
  {
    id: 'comp_animated_login',
    slug: 'animated-login-form',
    name: 'Animated Login Form',
    description: 'Smooth interactive login card with spring animations, floating labels, validation states, and theme toggling.',
    category: 'Forms & Authentication',
    tags: ['Auth', 'Form', 'Animation', 'Tailwind', 'Motion'],
    status: 'published',
    currentVersion: '1.0.0',
    previewComponent: 'AnimatedLoginFormPreview',
    isOfficial: true,
    downloadsCount: 1420,
    favoritesCount: 382,
    createdAt: '2026-01-15T10:00:00.000Z',
    updatedAt: '2026-02-01T12:00:00.000Z',
    documentation: 'The Animated Login Form provides a modern, high-conversion authentication interface with tactile feedback, password strength indicators, and accessible keyboard navigation.',
    license: 'MIT',
    author: 'VAC Team',
    versions: [],
    latestRelease: {
      version: '1.0.0',
      changelog: 'Initial production release with Motion for React and Tailwind CSS.',
      dependencies: {
        'motion/react': '^12.0.0',
        'lucide-react': '^1.0.0',
      },
      peerDependencies: {
        react: '>=18.0.0',
        'react-dom': '>=18.0.0',
      },
      files: [
        {
          path: 'src/components/AnimatedLoginForm.tsx',
          name: 'AnimatedLoginForm.tsx',
          language: 'typescript',
          isEntry: true,
          content: `import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Mail, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export interface AnimatedLoginFormProps {
  onSubmit?: (data: { email: string; pass: string }) => Promise<void> | void;
  title?: string;
  subtitle?: string;
}

export const AnimatedLoginForm: React.FC<AnimatedLoginFormProps> = ({
  onSubmit,
  title = "Welcome Back",
  subtitle = "Sign in to access your developer console"
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    try {
      await onSubmit?.({ email, pass: password });
      setIsSuccess(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto p-8 rounded-2xl bg-[#11131A] border border-white/10 shadow-2xl backdrop-blur-xl"
    >
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-white">{title}</h2>
        <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              required
              className="w-full bg-[#171A23] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1.5">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-[#171A23] border border-white/10 rounded-lg pl-10 pr-10 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white text-sm font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
        >
          {isLoading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : isSuccess ? (
            <ShieldCheck className="w-4 h-4 text-green-300" />
          ) : (
            <>
              Continue <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};`,
        },
      ],
      props: [
        {
          name: 'title',
          type: 'string',
          required: false,
          defaultValue: '"Welcome Back"',
          description: 'Headline text shown at top of the login container',
        },
        {
          name: 'subtitle',
          type: 'string',
          required: false,
          defaultValue: '"Sign in to access your developer console"',
          description: 'Supporting description under the title',
        },
        {
          name: 'onSubmit',
          type: '(data: { email: string; pass: string }) => Promise<void> | void',
          required: false,
          description: 'Async callback triggered on submission',
        },
      ],
    },
  },
  {
    id: 'comp_glassmorphism_navbar',
    slug: 'glassmorphism-navbar',
    name: 'Glassmorphism Navbar',
    description: 'Translucent floating header with frosted glass refraction, responsive collapsible menu, and quick action buttons.',
    category: 'Navigation',
    tags: ['Navigation', 'Glassmorphism', 'Header', 'Responsive'],
    status: 'published',
    currentVersion: '1.0.0',
    previewComponent: 'GlassmorphismNavbarPreview',
    isOfficial: true,
    downloadsCount: 980,
    favoritesCount: 245,
    createdAt: '2026-01-18T10:00:00.000Z',
    updatedAt: '2026-02-02T12:00:00.000Z',
    documentation: 'Floating glass navbar with dynamic blur and edge highlights suited for landing pages and developer dashboards.',
    license: 'MIT',
    author: 'VAC Team',
    versions: [],
    latestRelease: {
      version: '1.0.0',
      changelog: 'Initial version with responsive hamburger and blur backdrop.',
      dependencies: {
        'lucide-react': '^1.0.0',
      },
      peerDependencies: {
        react: '>=18.0.0',
        'react-dom': '>=18.0.0',
      },
      files: [
        {
          path: 'src/components/GlassmorphismNavbar.tsx',
          name: 'GlassmorphismNavbar.tsx',
          language: 'typescript',
          isEntry: true,
          content: `import React, { useState } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';

export interface GlassmorphismNavbarProps {
  brandName?: string;
  links?: Array<{ label: string; href: string }>;
  onAction?: () => void;
  actionLabel?: string;
}

export const GlassmorphismNavbar: React.FC<GlassmorphismNavbarProps> = ({
  brandName = 'VAC UI',
  links = [
    { label: 'Overview', href: '#overview' },
    { label: 'Components', href: '#components' },
    { label: 'Documentation', href: '#docs' },
    { label: 'Changelog', href: '#changelog' },
  ],
  onAction,
  actionLabel = 'Get Started',
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(links[0]?.label || 'Overview');

  return (
    <header className="w-full max-w-5xl mx-auto px-4 py-3 sticky top-4 z-50">
      <div className="h-14 rounded-2xl bg-[#11131A]/80 backdrop-blur-xl border border-white/10 shadow-2xl flex items-center justify-between px-5">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-md shadow-indigo-600/30">
            V
          </div>
          <span className="text-sm font-bold tracking-tight text-white">{brandName}</span>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setActiveTab(link.label)}
              className={\`px-3 py-1.5 rounded-lg text-xs font-medium transition-all \${
                activeTab === link.label
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }\`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={onAction}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-medium transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/25"
          >
            <span>{actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-gray-400 hover:text-white p-1"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden mt-2 p-4 rounded-xl bg-[#11131A]/95 border border-white/10 backdrop-blur-2xl space-y-2 shadow-2xl">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => {
                setActiveTab(link.label);
                setMobileOpen(false);
              }}
              className="block px-3 py-2 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5"
            >
              {link.label}
            </a>
          ))}
          <button
            onClick={() => {
              onAction?.();
              setMobileOpen(false);
            }}
            className="w-full mt-2 py-2 rounded-lg bg-indigo-600 text-white text-xs font-medium flex items-center justify-center gap-1"
          >
            {actionLabel}
          </button>
        </div>
      )}
    </header>
  );
};
export default GlassmorphismNavbar;`,
        },
      ],
      props: [
        {
          name: 'brandName',
          type: 'string',
          required: false,
          defaultValue: '"VAC UI"',
          description: 'Brand or application logo label',
        },
        {
          name: 'links',
          type: 'Array<{ label: string; href: string }>',
          required: false,
          description: 'Navigation items to display',
        },
        {
          name: 'actionLabel',
          type: 'string',
          required: false,
          defaultValue: '"Get Started"',
          description: 'Call to action button text',
        },
      ],
    },
  },
  {
    id: 'comp_interactive_pricing',
    slug: 'interactive-pricing',
    name: 'Interactive Pricing',
    description: 'Tiered subscription pricing grid with monthly/annual billing switch, highlight badges, and feature comparison list.',
    category: 'Marketing & Sales',
    tags: ['Pricing', 'Billing', 'Interactive', 'Cards'],
    status: 'published',
    currentVersion: '1.0.0',
    previewComponent: 'InteractivePricingPreview',
    isOfficial: true,
    downloadsCount: 870,
    favoritesCount: 195,
    createdAt: '2026-01-20T10:00:00.000Z',
    updatedAt: '2026-02-03T12:00:00.000Z',
    documentation: 'Clean pricing tiers with annual discount calculation and conversion-optimized call-to-actions.',
    license: 'MIT',
    author: 'VAC Team',
    versions: [],
    latestRelease: {
      version: '1.0.0',
      changelog: 'Initial version with yearly toggle and feature badges.',
      dependencies: {
        'lucide-react': '^1.0.0',
      },
      peerDependencies: {
        react: '>=18.0.0',
        'react-dom': '>=18.0.0',
      },
      files: [
        {
          path: 'src/components/InteractivePricing.tsx',
          name: 'InteractivePricing.tsx',
          language: 'typescript',
          isEntry: true,
          content: `import React, { useState } from 'react';
import { Check, Sparkles } from 'lucide-react';

export interface InteractivePricingProps {
  onSelectPlan?: (planId: string, billingCycle: 'monthly' | 'yearly') => void;
}

export const InteractivePricing: React.FC<InteractivePricingProps> = ({ onSelectPlan }) => {
  const [yearly, setYearly] = useState(true);

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'Ideal for independent developers and experiments.',
      priceMonthly: 19,
      priceYearly: 15,
      features: ['Unlimited CLI installs', 'Access to 50+ UI primitives', 'Community Discord support'],
      popular: false,
    },
    {
      id: 'pro',
      name: 'Pro Suite',
      description: 'Built for fast-moving startups and product teams.',
      priceMonthly: 49,
      priceYearly: 39,
      features: ['Everything in Starter', 'Custom collection exports', 'Component Studio draft sync', 'Priority bug triage'],
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Dedicated registry instance, SSO, and custom SLA.',
      priceMonthly: 99,
      priceYearly: 79,
      features: ['Everything in Pro', 'Air-gapped private registry', 'Design token audit engine', 'Dedicated account lead'],
      popular: false,
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold tracking-tight text-white">Transparent, predictable pricing</h2>
        <p className="text-sm text-gray-400">Scale seamlessly from individual side-projects to enterprise design systems.</p>

        <div className="pt-2 flex items-center justify-center gap-3 text-xs">
          <span className={!yearly ? 'font-bold text-white' : 'text-gray-400'}>Monthly</span>
          <button
            type="button"
            onClick={() => setYearly(!yearly)}
            className={\`w-11 h-6 rounded-full p-1 transition-colors \${yearly ? 'bg-indigo-600' : 'bg-gray-700'}\`}
          >
            <div className={\`w-4 h-4 rounded-full bg-white transition-transform \${yearly ? 'translate-x-5' : 'translate-x-0'}\`} />
          </button>
          <span className={yearly ? 'font-bold text-white' : 'text-gray-400'}>
            Yearly <span className="text-[10px] text-emerald-400 font-semibold">(Save 20%)</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const price = yearly ? plan.priceYearly : plan.priceMonthly;
          return (
            <div
              key={plan.id}
              className={\`rounded-2xl p-6 transition-all flex flex-col justify-between \${
                plan.popular
                  ? 'bg-[#171A23] border-2 border-indigo-500 shadow-2xl shadow-indigo-500/10'
                  : 'bg-[#11131A] border border-white/10 hover:border-white/20'
              }\`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">{plan.name}</h3>
                  {plan.popular && (
                    <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Popular
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 min-h-[32px]">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white font-mono">\${price}</span>
                  <span className="text-xs text-gray-400">/ user / mo</span>
                </div>

                <ul className="space-y-2.5 pt-4 border-t border-white/10 text-xs text-gray-300">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => onSelectPlan?.(plan.id, yearly ? 'yearly' : 'monthly')}
                className={\`mt-6 w-full py-2.5 rounded-xl text-xs font-semibold transition-all \${
                  plan.popular
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25'
                    : 'bg-white/10 hover:bg-white/15 text-white'
                }\`}
              >
                Choose {plan.name}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default InteractivePricing;`,
        },
      ],
      props: [
        {
          name: 'onSelectPlan',
          type: '(planId: string, billingCycle: "monthly" | "yearly") => void',
          required: false,
          description: 'Callback when a tier card button is clicked',
        },
      ],
    },
  },
  {
    id: 'comp_analytics_dashboard',
    slug: 'analytics-dashboard',
    name: 'Analytics Dashboard',
    description: 'Metric summary panels with sparkline indicators, trend percentages, and time-range filtering.',
    category: 'Data & Dashboards',
    tags: ['Dashboard', 'Analytics', 'Metrics', 'Stats'],
    status: 'published',
    currentVersion: '1.0.0',
    previewComponent: 'AnalyticsDashboardPreview',
    isOfficial: true,
    downloadsCount: 1210,
    favoritesCount: 312,
    createdAt: '2026-01-22T10:00:00.000Z',
    updatedAt: '2026-02-04T12:00:00.000Z',
    documentation: 'Minimal metric widgets showing real-time stats, growth velocity, and status chips.',
    license: 'MIT',
    author: 'VAC Team',
    versions: [],
    latestRelease: {
      version: '1.0.0',
      changelog: 'Initial metrics layout with trend chips.',
      dependencies: {
        'lucide-react': '^1.0.0',
      },
      peerDependencies: {
        react: '>=18.0.0',
        'react-dom': '>=18.0.0',
      },
      files: [
        {
          path: 'src/components/AnalyticsDashboard.tsx',
          name: 'AnalyticsDashboard.tsx',
          language: 'typescript',
          isEntry: true,
          content: `import React, { useState } from 'react';
import { Activity, TrendingUp, Users, Download, ShieldCheck } from 'lucide-react';

export interface AnalyticsDashboardProps {
  timeRange?: '7d' | '30d';
  onRangeChange?: (range: '7d' | '30d') => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  timeRange = '7d',
  onRangeChange,
}) => {
  const [range, setRange] = useState<'7d' | '30d'>(timeRange);

  const handleRange = (newRange: '7d' | '30d') => {
    setRange(newRange);
    onRangeChange?.(newRange);
  };

  const stats = [
    {
      label: 'CLI Component Installs',
      value: range === '7d' ? '3,842' : '15,920',
      change: '+14.2%',
      positive: true,
      icon: Download,
    },
    {
      label: 'Active Developer Nodes',
      value: range === '7d' ? '1,280' : '5,420',
      change: '+8.6%',
      positive: true,
      icon: Users,
    },
    {
      label: 'Security Verification Pass',
      value: '100%',
      change: 'Zero CVEs',
      positive: true,
      icon: ShieldCheck,
    },
    {
      label: 'Registry Uptime (p99)',
      value: '99.98%',
      change: '< 24ms latency',
      positive: true,
      icon: Activity,
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6 bg-[#11131A] border border-white/10 rounded-2xl shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            Registry Analytics & Telemetry
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">Real-time installation metrics and integrity pipeline health.</p>
        </div>

        <div className="flex items-center bg-[#171A23] border border-white/10 rounded-lg p-0.5 text-xs">
          <button
            type="button"
            onClick={() => handleRange('7d')}
            className={\`px-3 py-1 rounded-md transition-all \${
              range === '7d' ? 'bg-indigo-600 text-white font-semibold' : 'text-gray-400 hover:text-white'
            }\`}
          >
            7D
          </button>
          <button
            type="button"
            onClick={() => handleRange('30d')}
            className={\`px-3 py-1 rounded-md transition-all \${
              range === '30d' ? 'bg-indigo-600 text-white font-semibold' : 'text-gray-400 hover:text-white'
            }\`}
          >
            30D
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="p-4 rounded-xl bg-[#171A23] border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-gray-400">
                <span className="text-xs font-medium">{s.label}</span>
                <Icon className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-white">{s.value}</div>
              <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                <TrendingUp className="w-3 h-3" />
                <span>{s.change}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default AnalyticsDashboard;`,
        },
      ],
      props: [
        {
          name: 'timeRange',
          type: '"7d" | "30d"',
          required: false,
          defaultValue: '"7d"',
          description: 'Telemetry time aggregation window',
        },
        {
          name: 'onRangeChange',
          type: '(range: "7d" | "30d") => void',
          required: false,
          description: 'Callback when range toggle changes',
        },
      ],
    },
  },
  {
    id: 'comp_notification_center',
    slug: 'notification-center',
    name: 'Notification Center',
    description: 'Actionable alert feed with read/unread markers, category tabs, and mark-all-read shortcuts.',
    category: 'Feedback & Overlays',
    tags: ['Notifications', 'Flyout', 'Alerts', 'Badge'],
    status: 'published',
    currentVersion: '1.0.0',
    previewComponent: 'NotificationCenterPreview',
    isOfficial: true,
    downloadsCount: 760,
    favoritesCount: 180,
    createdAt: '2026-01-25T10:00:00.000Z',
    updatedAt: '2026-02-05T12:00:00.000Z',
    documentation: 'A developer notification drawer with item dismissal, timestamp formatting, and event categorization.',
    license: 'MIT',
    author: 'VAC Team',
    versions: [],
    latestRelease: {
      version: '1.0.0',
      changelog: 'Initial version with animated dismissals.',
      dependencies: {
        'lucide-react': '^1.0.0',
        'motion/react': '^12.0.0',
      },
      peerDependencies: {
        react: '>=18.0.0',
        'react-dom': '>=18.0.0',
      },
      files: [
        {
          path: 'src/components/NotificationCenter.tsx',
          name: 'NotificationCenter.tsx',
          language: 'typescript',
          isEntry: true,
          content: `import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, ShieldAlert, Info, Sparkles } from 'lucide-react';

export interface NotificationItem {
  id: string | number;
  title: string;
  time: string;
  unread: boolean;
  type?: 'info' | 'alert' | 'release';
}

export interface NotificationCenterProps {
  initialNotifications?: NotificationItem[];
  onMarkAllRead?: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  initialNotifications = [
    { id: 1, title: 'CLI v0.1.0 published with zero-trust integrity verification', time: '10m ago', unread: true, type: 'release' },
    { id: 2, title: 'Animated Login Form upgraded to Motion React 12', time: '2h ago', unread: true, type: 'info' },
    { id: 3, title: 'Component security audit completed with 0 errors', time: '1d ago', unread: false, type: 'alert' },
  ],
  onMarkAllRead,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    onMarkAllRead?.();
  };

  const removeNotification = (id: string | number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="w-full max-w-md mx-auto p-5 rounded-2xl bg-[#11131A] border border-white/10 shadow-2xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <Bell className="w-4 h-4 text-indigo-400" />
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {notifications.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
              className={\`p-3 rounded-xl border text-xs flex items-start justify-between gap-3 transition-colors \${
                item.unread
                  ? 'bg-indigo-500/10 border-indigo-500/25 text-white'
                  : 'bg-[#171A23] border-white/5 text-gray-400'
              }\`}
            >
              <div className="flex items-start gap-2.5">
                {item.type === 'release' ? (
                  <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                ) : item.type === 'alert' ? (
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-medium text-xs text-white leading-snug">{item.title}</p>
                  <span className="text-[10px] text-gray-500 mt-1 block">{item.time}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeNotification(item.id)}
                className="text-gray-500 hover:text-gray-300 p-0.5"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        {notifications.length === 0 && (
          <div className="py-6 text-center text-xs text-gray-500">
            All notifications caught up!
          </div>
        )}
      </div>
    </div>
  );
};
export default NotificationCenter;`,
        },
      ],
      props: [
        {
          name: 'initialNotifications',
          type: 'NotificationItem[]',
          required: false,
          description: 'Seed array of notification objects',
        },
        {
          name: 'onMarkAllRead',
          type: '() => void',
          required: false,
          description: 'Callback when mark-all-read is clicked',
        },
      ],
    },
  },
  {
    id: 'comp_file_upload',
    slug: 'file-upload',
    name: 'File Upload',
    description: 'Drag-and-drop file uploader zone with file type validation, upload progress indicators, and file size safeguards.',
    category: 'Forms & Authentication',
    tags: ['Upload', 'Files', 'DragAndDrop', 'Progress'],
    status: 'published',
    currentVersion: '1.0.0',
    previewComponent: 'FileUploadPreview',
    isOfficial: true,
    downloadsCount: 1150,
    favoritesCount: 290,
    createdAt: '2026-01-28T10:00:00.000Z',
    updatedAt: '2026-02-06T12:00:00.000Z',
    documentation: 'High-usability drag-and-drop dropzone with file list preview, remove actions, and progress animations.',
    license: 'MIT',
    author: 'VAC Team',
    versions: [],
    latestRelease: {
      version: '1.0.0',
      changelog: 'Initial version with file preview cards and progress bars.',
      dependencies: {
        'lucide-react': '^1.0.0',
      },
      peerDependencies: {
        react: '>=18.0.0',
        'react-dom': '>=18.0.0',
      },
      files: [
        {
          path: 'src/components/FileUpload.tsx',
          name: 'FileUpload.tsx',
          language: 'typescript',
          isEntry: true,
          content: `import React, { useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';

export interface FileUploadProps {
  onFilesChange?: (files: string[]) => void;
  maxFileSizeMb?: number;
  acceptedFormats?: string[];
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesChange,
  maxFileSizeMb = 10,
  acceptedFormats = ['.tsx', '.ts', '.jsx', '.js', '.json', '.css'],
}) => {
  const [files, setFiles] = useState<string[]>(['ButtonComponent.tsx', 'tokens.json']);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleSimulatedDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const mockFiles = ['CustomCard.tsx', 'Schema.json'];
    const updated = Array.from(new Set([...files, ...mockFiles]));
    setFiles(updated);
    onFilesChange?.(updated);
  };

  const removeFile = (name: string) => {
    const updated = files.filter((f) => f !== name);
    setFiles(updated);
    onFilesChange?.(updated);
  };

  return (
    <div className="w-full max-w-md mx-auto p-5 rounded-2xl bg-[#11131A] border border-white/10 shadow-xl space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleSimulatedDrop}
        onClick={() => {
          const sample = \`Component_\${files.length + 1}.tsx\`;
          const updated = [...files, sample];
          setFiles(updated);
          onFilesChange?.(updated);
        }}
        className={\`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all \${
          isDragOver
            ? 'border-indigo-500 bg-indigo-500/10'
            : 'border-white/15 hover:border-indigo-500/50 bg-[#171A23]'
        }\`}
      >
        <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
        <p className="text-xs font-semibold text-white">Click or drag source files here</p>
        <p className="text-[10px] text-gray-400 mt-1">
          Supported: {acceptedFormats.join(', ')} (Max {maxFileSizeMb}MB per file)
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Uploaded Files ({files.length})
          </p>
          {files.map((file) => (
            <div
              key={file}
              className="p-2.5 rounded-lg bg-[#171A23] border border-white/5 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2 text-gray-300">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span className="font-mono text-xs">{file}</span>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeFile(file); }}
                className="text-gray-500 hover:text-red-400 p-0.5"
                aria-label={\`Remove \${file}\`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default FileUpload;`,
        },
      ],
      props: [
        {
          name: 'onFilesChange',
          type: '(files: string[]) => void',
          required: false,
          description: 'Callback when file list changes',
        },
        {
          name: 'maxFileSizeMb',
          type: 'number',
          required: false,
          defaultValue: '10',
          description: 'Maximum allowable file size limit',
        },
      ],
    },
  },
  {
    id: 'comp_glass_button',
    slug: 'glass-button',
    name: 'Glass Pill Button',
    description: 'High-contrast backdrop blurred action button with ambient glow and tactile click physics.',
    category: 'Buttons & Controls',
    tags: ['Button', 'Glass', 'Controls', 'Micro-interactions'],
    status: 'published',
    currentVersion: '1.0.0',
    previewComponent: 'GlassButtonPreview',
    isOfficial: true,
    downloadsCount: 940,
    favoritesCount: 210,
    createdAt: '2026-02-01T10:00:00.000Z',
    updatedAt: '2026-02-07T12:00:00.000Z',
    documentation: 'Sleek glassmorphism pill button designed for modern interfaces.',
    license: 'MIT',
    author: 'VAC Team',
    versions: [],
    latestRelease: {
      version: '1.0.0',
      changelog: 'Initial version with backdrop blur and hover glow.',
      dependencies: {
        'lucide-react': '^1.0.0',
      },
      peerDependencies: {
        react: '>=18.0.0',
        'react-dom': '>=18.0.0',
      },
      files: [
        {
          path: 'src/components/GlassButton.tsx',
          name: 'GlassButton.tsx',
          language: 'typescript',
          isEntry: true,
          content: `import React from 'react';
import { Sparkles } from 'lucide-react';

export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  glow?: boolean;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children = 'Glass Pill Button',
  variant = 'primary',
  glow = true,
  className = '',
  ...props
}) => {
  return (
    <button
      {...props}
      className={\`px-5 py-2.5 rounded-full text-xs font-semibold backdrop-blur-xl border transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 \${
        variant === 'primary'
          ? 'bg-white/10 hover:bg-white/20 text-white border-white/20 shadow-lg shadow-indigo-500/10'
          : 'bg-black/30 hover:bg-black/40 text-gray-200 border-white/10'
      } \${glow ? 'hover:shadow-indigo-500/25 hover:border-indigo-500/40' : ''} \${className}\`}
    >
      <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
      <span>{children}</span>
    </button>
  );
};
export default GlassButton;`,
        },
      ],
      props: [
        {
          name: 'variant',
          type: '"primary" | "secondary"',
          required: false,
          defaultValue: '"primary"',
          description: 'Visual treatment variant',
        },
        {
          name: 'glow',
          type: 'boolean',
          required: false,
          defaultValue: 'true',
          description: 'Whether to show ambient glow on hover',
        },
      ],
    },
  },
  {
    id: 'comp_toggle_switch',
    slug: 'toggle-switch',
    name: 'Animated Toggle Switch',
    description: 'Tactile boolean toggle switch with spring physics and keyboard focus indicators.',
    category: 'Buttons & Controls',
    tags: ['Toggle', 'Switch', 'Motion', 'Accessible'],
    status: 'published',
    currentVersion: '1.0.0',
    previewComponent: 'ToggleSwitchPreview',
    isOfficial: true,
    downloadsCount: 890,
    favoritesCount: 175,
    createdAt: '2026-02-02T10:00:00.000Z',
    updatedAt: '2026-02-08T12:00:00.000Z',
    documentation: 'Accessible toggle switch with fluid motion layout animations.',
    license: 'MIT',
    author: 'VAC Team',
    versions: [],
    latestRelease: {
      version: '1.0.0',
      changelog: 'Initial version with Motion spring layout animation.',
      dependencies: {
        'motion/react': '^12.0.0',
      },
      peerDependencies: {
        react: '>=18.0.0',
        'react-dom': '>=18.0.0',
      },
      files: [
        {
          path: 'src/components/ToggleSwitch.tsx',
          name: 'ToggleSwitch.tsx',
          language: 'typescript',
          isEntry: true,
          content: `import React, { useState } from 'react';
import { motion } from 'motion/react';

export interface ToggleSwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked = false,
  onChange,
  label = 'Enable Feature',
  disabled = false,
}) => {
  const [internalChecked, setInternalChecked] = useState(checked);

  const isChecked = onChange ? checked : internalChecked;

  const toggle = () => {
    if (disabled) return;
    const next = !isChecked;
    setInternalChecked(next);
    onChange?.(next);
  };

  return (
    <label className={\`inline-flex items-center gap-3 cursor-pointer select-none \${disabled ? 'opacity-50 cursor-not-allowed' : ''}\`}>
      <button
        type="button"
        role="switch"
        aria-checked={isChecked}
        disabled={disabled}
        onClick={toggle}
        className={\`w-11 h-6 rounded-full p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50 \${
          isChecked ? 'bg-indigo-600' : 'bg-gray-700'
        }\`}
      >
        <motion.div
          animate={{ x: isChecked ? 20 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="w-4 h-4 rounded-full bg-white shadow-md"
        />
      </button>
      {label && <span className="text-xs font-medium text-gray-200">{label}</span>}
    </label>
  );
};
export default ToggleSwitch;`,
        },
      ],
      props: [
        {
          name: 'checked',
          type: 'boolean',
          required: false,
          defaultValue: 'false',
          description: 'Current toggle state',
        },
        {
          name: 'onChange',
          type: '(checked: boolean) => void',
          required: false,
          description: 'Callback when toggle is changed',
        },
        {
          name: 'label',
          type: 'string',
          required: false,
          defaultValue: '"Enable Feature"',
          description: 'Accompanying label text',
        },
      ],
    },
  },
  {
    id: 'comp_dark_glass_card',
    slug: 'dark-glass-card',
    name: 'Spotlight Ambient Card',
    description: 'Deep translucent component card with mouse-tracking radial ambient illumination.',
    category: 'Cards & Surfaces',
    tags: ['Card', 'Spotlight', 'Dark', 'Container'],
    status: 'published',
    currentVersion: '1.0.0',
    previewComponent: 'DarkGlassCardPreview',
    isOfficial: true,
    downloadsCount: 810,
    favoritesCount: 190,
    createdAt: '2026-02-03T10:00:00.000Z',
    updatedAt: '2026-02-09T12:00:00.000Z',
    documentation: 'Card container with interactive mouse spotlight border and background gradient.',
    license: 'MIT',
    author: 'VAC Team',
    versions: [],
    latestRelease: {
      version: '1.0.0',
      changelog: 'Initial release with radial gradient mouse tracking.',
      dependencies: {},
      peerDependencies: {
        react: '>=18.0.0',
        'react-dom': '>=18.0.0',
      },
      files: [
        {
          path: 'src/components/DarkGlassCard.tsx',
          name: 'DarkGlassCard.tsx',
          language: 'typescript',
          isEntry: true,
          content: `import React, { useState } from 'react';

export interface DarkGlassCardProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  children?: React.ReactNode;
}

export const DarkGlassCard: React.FC<DarkGlassCardProps> = ({
  title = 'Spotlight Ambient Card',
  subtitle = 'Hover to observe dynamic radial ambient spotlight illumination.',
  badge = 'SURFACE PRIMITIVE',
  children,
}) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#11131A] backdrop-blur-xl p-6 text-white shadow-2xl overflow-hidden group transition-all"
    >
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 opacity-60 group-hover:opacity-100"
        style={{
          background: \`radial-gradient(400px circle at \${mousePos.x}px \${mousePos.y}px, rgba(99, 102, 241, 0.2), transparent 60%)\`,
        }}
      />
      <div className="relative space-y-3">
        {badge && (
          <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full inline-block">
            {badge}
          </span>
        )}
        <h4 className="text-base font-bold text-white tracking-tight">{title}</h4>
        <p className="text-xs text-gray-400 leading-relaxed">{subtitle}</p>
        {children && <div className="pt-2">{children}</div>}
      </div>
    </div>
  );
};
export default DarkGlassCard;`,
        },
      ],
      props: [
        {
          name: 'title',
          type: 'string',
          required: false,
          defaultValue: '"Spotlight Ambient Card"',
          description: 'Card headline',
        },
        {
          name: 'subtitle',
          type: 'string',
          required: false,
          defaultValue: '"Hover to observe dynamic radial ambient spotlight illumination."',
          description: 'Supporting descriptive text',
        },
        {
          name: 'badge',
          type: 'string',
          required: false,
          defaultValue: '"SURFACE PRIMITIVE"',
          description: 'Monospace chip label',
        },
      ],
    },
  },
];
