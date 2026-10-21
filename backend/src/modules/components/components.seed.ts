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
        'motion/react': '^12.0.0',
      },
      peerDependencies: {
        react: '>=18.0.0',
      },
      files: [
        {
          path: 'src/components/GlassmorphismNavbar.tsx',
          name: 'GlassmorphismNavbar.tsx',
          language: 'typescript',
          isEntry: true,
          content: `// GlassmorphismNavbar implementation`,
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
        'motion/react': '^12.0.0',
      },
      peerDependencies: {
        react: '>=18.0.0',
      },
      files: [],
      props: [],
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
      },
      files: [],
      props: [],
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
      },
      files: [],
      props: [],
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
        'motion/react': '^12.0.0',
      },
      peerDependencies: {
        react: '>=18.0.0',
      },
      files: [],
      props: [],
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
      },
      files: [],
      props: [],
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
      },
      files: [],
      props: [],
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
      dependencies: {
        'lucide-react': '^1.0.0',
      },
      peerDependencies: {
        react: '>=18.0.0',
      },
      files: [],
      props: [],
    },
  },
];
