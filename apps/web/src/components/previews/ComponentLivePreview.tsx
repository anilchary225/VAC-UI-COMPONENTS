import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  Upload,
  FileText,
  X,
  Check,
  Bell,
  Sparkles,
  TrendingUp,
  Activity,
  Layers,
  RotateCcw,
  Monitor,
  Tablet,
  Smartphone,
  Sun,
  Moon,
  Info,
} from 'lucide-react';

interface ComponentLivePreviewProps {
  slug: string;
}

// -----------------------------------------------------------------------------
// 1. Animated Login Form Live Implementation
// -----------------------------------------------------------------------------
const AnimatedLoginFormLive: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    }, 1200);
  };

  return (
    <div className="w-full max-w-sm mx-auto p-6 rounded-2xl bg-white dark:bg-[#11131A] border border-[#E8EAEF] dark:border-white/10 shadow-xl transition-all">
      <div className="mb-5 text-center">
        <h4 className="text-lg font-bold text-[#161722] dark:text-white">Welcome Back</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Sign in to console</p>
      </div>

      {isSuccess ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto">
            <Check className="w-4 h-4" />
          </div>
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Authenticated successfully!</p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dev@vac.design"
                className="w-full bg-gray-50 dark:bg-black/30 border border-[#E8EAEF] dark:border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-[#161722] dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#5B4FF5]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 dark:bg-black/30 border border-[#E8EAEF] dark:border-white/10 rounded-xl pl-9 pr-9 py-2 text-xs text-[#161722] dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#5B4FF5]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 rounded-xl bg-[#5B4FF5] hover:bg-[#4D40E6] text-white text-xs font-semibold shadow-md flex items-center justify-center gap-1.5 transition-all disabled:opacity-60 cursor-pointer"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

// -----------------------------------------------------------------------------
// 2. Glassmorphism Navbar Live Implementation
// -----------------------------------------------------------------------------
const GlassmorphismNavbarLive: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const tabs = ['Overview', 'Components', 'Docs', 'Changelog'];

  return (
    <div className="w-full p-4 flex flex-col items-center justify-center min-h-[160px] bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent rounded-2xl relative overflow-hidden">
      <header className="w-full max-w-md h-12 rounded-full bg-white/70 dark:bg-black/60 backdrop-blur-xl border border-white/50 dark:border-white/15 shadow-lg flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#5B4FF5] text-white flex items-center justify-center text-xs font-bold">
            V
          </div>
          <span className="text-xs font-bold text-[#161722] dark:text-white">VAC UI</span>
        </div>

        <nav className="flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                activeTab === tab
                  ? 'bg-[#5B4FF5] text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </header>
    </div>
  );
};

// -----------------------------------------------------------------------------
// 3. Interactive Pricing Live Implementation
// -----------------------------------------------------------------------------
const InteractivePricingLive: React.FC = () => {
  const [yearly, setYearly] = useState(true);

  return (
    <div className="w-full space-y-4">
      {/* Switch */}
      <div className="flex items-center justify-center gap-2 text-xs">
        <span className={!yearly ? 'font-bold text-[#161722] dark:text-white' : 'text-gray-400'}>Monthly</span>
        <button
          onClick={() => setYearly(!yearly)}
          className={`w-10 h-5 rounded-full p-0.5 transition-colors ${yearly ? 'bg-[#5B4FF5]' : 'bg-gray-300 dark:bg-gray-700'}`}
        >
          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${yearly ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
        <span className={yearly ? 'font-bold text-[#161722] dark:text-white' : 'text-gray-400'}>
          Yearly <span className="text-[10px] text-emerald-500 font-semibold">(20% off)</span>
        </span>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
        <div className="p-4 rounded-xl border border-[#E8EAEF] dark:border-white/10 bg-white dark:bg-[#11131A] space-y-2">
          <span className="text-xs font-semibold text-gray-500">Starter</span>
          <div className="text-xl font-bold text-[#161722] dark:text-white">
            ${yearly ? '19' : '24'}<span className="text-xs font-normal text-gray-400">/mo</span>
          </div>
          <ul className="text-[11px] text-gray-500 space-y-1 pt-1">
            <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-500" /> Unlimited CLI installs</li>
            <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-500" /> Standard updates</li>
          </ul>
        </div>

        <div className="p-4 rounded-xl border border-[#5B4FF5] bg-[#5B4FF5]/5 dark:bg-[#5B4FF5]/10 space-y-2 relative overflow-hidden">
          <span className="text-xs font-bold text-[#5B4FF5]">Pro Suite</span>
          <div className="text-xl font-bold text-[#161722] dark:text-white">
            ${yearly ? '49' : '59'}<span className="text-xs font-normal text-gray-400">/mo</span>
          </div>
          <ul className="text-[11px] text-gray-600 dark:text-gray-300 space-y-1 pt-1">
            <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#5B4FF5]" /> Custom Collections</li>
            <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-[#5B4FF5]" /> Priority Discord</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// 4. Analytics Dashboard Live Implementation
// -----------------------------------------------------------------------------
const AnalyticsDashboardLive: React.FC = () => {
  const [range, setRange] = useState<'7d' | '30d'>('7d');

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-[#161722] dark:text-white flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-[#5B4FF5]" /> Telemetry Overview
        </span>
        <div className="flex items-center bg-gray-100 dark:bg-white/5 rounded-lg p-0.5 text-[11px]">
          <button
            onClick={() => setRange('7d')}
            className={`px-2 py-0.5 rounded-md ${range === '7d' ? 'bg-white dark:bg-white/10 font-bold shadow-xs' : 'text-gray-400'}`}
          >
            7D
          </button>
          <button
            onClick={() => setRange('30d')}
            className={`px-2 py-0.5 rounded-md ${range === '30d' ? 'bg-white dark:bg-white/10 font-bold shadow-xs' : 'text-gray-400'}`}
          >
            30D
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl border border-[#E8EAEF] dark:border-white/10 bg-white dark:bg-[#11131A] space-y-1">
          <span className="text-[11px] text-gray-400">Total CLI Installs</span>
          <div className="text-lg font-bold text-[#161722] dark:text-white">
            {range === '7d' ? '3,842' : '15,920'}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-medium">
            <TrendingUp className="w-3 h-3" /> +14.2% from prior period
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-[#E8EAEF] dark:border-white/10 bg-white dark:bg-[#11131A] space-y-1">
          <span className="text-[11px] text-gray-400">Active Developers</span>
          <div className="text-lg font-bold text-[#161722] dark:text-white">
            {range === '7d' ? '1,280' : '5,420'}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-purple-400 font-medium">
            <TrendingUp className="w-3 h-3" /> +8.6% engagement
          </div>
        </div>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// 5. Notification Center Live Implementation
// -----------------------------------------------------------------------------
const NotificationCenterLive: React.FC = () => {
  const [alerts, setAlerts] = useState([
    { id: 1, title: 'CLI v0.1.0 published', time: '10m ago', unread: true },
    { id: 2, title: 'Animated Login Form updated', time: '2h ago', unread: true },
    { id: 3, title: 'Component security audit passed', time: '1d ago', unread: false },
  ]);

  const markAllRead = () => {
    setAlerts(alerts.map((a) => ({ ...a, unread: false })));
  };

  return (
    <div className="w-full max-w-sm mx-auto p-4 rounded-2xl bg-white dark:bg-[#11131A] border border-[#E8EAEF] dark:border-white/10 shadow-lg space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-[#E8EAEF] dark:border-white/10 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-[#161722] dark:text-white">
          <Bell className="w-3.5 h-3.5 text-[#5B4FF5]" />
          <span>Notifications</span>
          {alerts.filter((a) => a.unread).length > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#5B4FF5] text-white text-[10px] flex items-center justify-center font-bold">
              {alerts.filter((a) => a.unread).length}
            </span>
          )}
        </div>
        <button onClick={markAllRead} className="text-[11px] text-[#5B4FF5] hover:underline font-medium">
          Mark all read
        </button>
      </div>

      <div className="space-y-2">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            onClick={() => setAlerts(alerts.map((a) => (a.id === alert.id ? { ...a, unread: false } : a)))}
            className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
              alert.unread
                ? 'bg-purple-500/5 border-purple-500/20'
                : 'bg-gray-50/50 dark:bg-white/[0.02] border-[#E8EAEF] dark:border-white/5 opacity-75'
            }`}
          >
            <div className="space-y-0.5">
              <p className="font-medium text-[#161722] dark:text-white text-[11px]">{alert.title}</p>
              <span className="text-[10px] text-gray-400">{alert.time}</span>
            </div>
            {alert.unread && <div className="w-2 h-2 rounded-full bg-[#5B4FF5]" />}
          </div>
        ))}
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// 6. File Upload Live Implementation
// -----------------------------------------------------------------------------
const FileUploadLive: React.FC = () => {
  const [files, setFiles] = useState<string[]>(['ButtonTheme.css']);

  const addSimulatedFile = () => {
    const names = ['Config.json', 'AnimatedCard.tsx', 'Schema.prisma'];
    const next = names.find((n) => !files.includes(n)) || `Upload_${files.length + 1}.tsx`;
    setFiles([...files, next]);
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-3">
      <div
        onClick={addSimulatedFile}
        className="border-2 border-dashed border-[#5B4FF5]/40 hover:border-[#5B4FF5] rounded-2xl p-6 text-center cursor-pointer bg-purple-500/5 hover:bg-purple-500/10 transition-all"
      >
        <Upload className="w-6 h-6 text-[#5B4FF5] mx-auto mb-2" />
        <p className="text-xs font-semibold text-[#161722] dark:text-white">Click or drag files here</p>
        <p className="text-[10px] text-gray-400 mt-0.5">Supports TSX, CSS, JSON up to 25MB</p>
      </div>

      {files.length > 0 && (
        <div className="space-y-1.5">
          {files.map((file) => (
            <div
              key={file}
              className="p-2 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-[#E8EAEF] dark:border-white/10 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <FileText className="w-3.5 h-3.5 text-[#5B4FF5]" />
                <span className="font-mono text-[11px] truncate">{file}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFiles(files.filter((f) => f !== file));
                }}
                className="text-gray-400 hover:text-red-500"
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

// -----------------------------------------------------------------------------
// 7. Glass Pill Button Live Implementation
// -----------------------------------------------------------------------------
const GlassButtonLive: React.FC = () => {
  const [clicks, setClicks] = useState(0);

  return (
    <div className="w-full py-8 flex flex-col items-center justify-center gap-4 bg-gradient-to-r from-purple-900/40 via-black to-slate-900/60 rounded-2xl p-6 border border-white/10">
      <button
        onClick={() => setClicks((c) => c + 1)}
        className="px-6 py-2.5 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 backdrop-blur-xl border border-white/30 text-white font-medium text-xs shadow-lg flex items-center gap-2 transition-all cursor-pointer"
      >
        <Sparkles className="w-3.5 h-3.5 text-purple-300" />
        <span>Glass Pill Button</span>
      </button>
      <span className="text-[11px] text-gray-400 font-mono">Clicks registered: {clicks}</span>
    </div>
  );
};

// -----------------------------------------------------------------------------
// 8. Animated Toggle Switch Live Implementation
// -----------------------------------------------------------------------------
const ToggleSwitchLive: React.FC = () => {
  const [checked, setChecked] = useState(true);

  return (
    <div className="w-full py-6 flex flex-col items-center justify-center gap-3">
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500">Live Preview State</span>
        <button
          onClick={() => setChecked(!checked)}
          className={`w-12 h-6.5 rounded-full p-1 cursor-pointer transition-colors ${
            checked ? 'bg-[#5B4FF5]' : 'bg-gray-300 dark:bg-gray-700'
          }`}
        >
          <div
            className={`w-4.5 h-4.5 rounded-full bg-white shadow-md transition-transform ${
              checked ? 'translate-x-5.5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
      <span className="text-[11px] font-mono text-gray-400">
        Status: <span className={checked ? 'text-emerald-400 font-bold' : 'text-gray-400'}>{checked ? 'ACTIVE' : 'INACTIVE'}</span>
      </span>
    </div>
  );
};

// -----------------------------------------------------------------------------
// 9. Spotlight Ambient Card Live Implementation
// -----------------------------------------------------------------------------
const DarkGlassCardLive: React.FC = () => {
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
      className="relative w-full max-w-sm mx-auto rounded-2xl border border-white/15 bg-black/80 backdrop-blur-xl p-6 text-white shadow-2xl overflow-hidden group"
    >
      {/* Dynamic spotlight glow */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 opacity-60 group-hover:opacity-100"
        style={{
          background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(91, 79, 245, 0.25), transparent 60%)`,
        }}
      />
      <div className="relative space-y-2">
        <span className="text-[10px] font-mono text-[#5B4FF5] bg-[#5B4FF5]/20 px-2 py-0.5 rounded-full">
          SPOTLIGHT DYNAMICS
        </span>
        <h4 className="text-sm font-bold text-white">Spotlight Ambient Card</h4>
        <p className="text-xs text-gray-400 leading-relaxed">
          Hover across this surface to observe the real-time mouse-tracking radial spotlight shader.
        </p>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Master Container with Viewport Controls and Theme Switcher
// -----------------------------------------------------------------------------
export const ComponentLivePreview: React.FC<ComponentLivePreviewProps> = ({ slug }) => {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewTheme, setPreviewTheme] = useState<'inherit' | 'light' | 'dark'>('inherit');
  const [resetKey, setResetKey] = useState(0);

  const getViewportMaxWidth = () => {
    if (viewport === 'mobile') return 'max-w-[340px]';
    if (viewport === 'tablet') return 'max-w-[580px]';
    return 'max-w-full';
  };

  const renderComponent = () => {
    switch (slug) {
      case 'animated-login-form':
        return <AnimatedLoginFormLive />;
      case 'glassmorphism-navbar':
        return <GlassmorphismNavbarLive />;
      case 'interactive-pricing':
        return <InteractivePricingLive />;
      case 'analytics-dashboard':
        return <AnalyticsDashboardLive />;
      case 'notification-center':
        return <NotificationCenterLive />;
      case 'file-upload':
        return <FileUploadLive />;
      case 'glass-button':
        return <GlassButtonLive />;
      case 'toggle-switch':
        return <ToggleSwitchLive />;
      case 'dark-glass-card':
        return <DarkGlassCardLive />;
      default:
        return (
          <div className="p-8 text-center text-xs text-gray-400">
            Preview for <span className="font-mono text-[#5B4FF5]">{slug}</span> ready.
          </div>
        );
    }
  };

  return (
    <div className="space-y-3">
      {/* Controls Bar for Live Preview */}
      <div className="flex items-center justify-between text-xs pb-1 border-b border-[#E8EAEF] dark:border-white/10">
        <div className="flex items-center gap-1.5 font-medium text-gray-500">
          <span>Viewport:</span>
          <div className="flex items-center bg-gray-100 dark:bg-white/5 rounded-lg p-0.5">
            <button
              onClick={() => setViewport('desktop')}
              className={`p-1 rounded-md ${viewport === 'desktop' ? 'bg-white dark:bg-white/10 text-[#5B4FF5] shadow-xs' : 'text-gray-400 hover:text-black dark:hover:text-white'}`}
              title="Desktop viewport (100%)"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewport('tablet')}
              className={`p-1 rounded-md ${viewport === 'tablet' ? 'bg-white dark:bg-white/10 text-[#5B4FF5] shadow-xs' : 'text-gray-400 hover:text-black dark:hover:text-white'}`}
              title="Tablet viewport (580px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`p-1 rounded-md ${viewport === 'mobile' ? 'bg-white dark:bg-white/10 text-[#5B4FF5] shadow-xs' : 'text-gray-400 hover:text-black dark:hover:text-white'}`}
              title="Mobile viewport (340px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Override */}
          <div className="flex items-center bg-gray-100 dark:bg-white/5 rounded-lg p-0.5">
            <button
              onClick={() => setPreviewTheme(previewTheme === 'dark' ? 'light' : 'dark')}
              className="p-1 rounded-md text-gray-400 hover:text-[#5B4FF5]"
              title="Toggle preview theme"
            >
              {previewTheme === 'dark' ? <Moon className="w-3.5 h-3.5 text-purple-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
            </button>
          </div>

          {/* Reset Action */}
          <button
            onClick={() => setResetKey((k) => k + 1)}
            className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-[#5B4FF5] transition-colors"
            title="Reset component state"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Viewport Frame */}
      <div
        className={`w-full ${getViewportMaxWidth()} mx-auto transition-all duration-200 p-6 rounded-2xl bg-gray-50/80 dark:bg-black/40 border border-[#E8EAEF] dark:border-white/10 flex items-center justify-center min-h-[220px] ${
          previewTheme === 'dark' ? 'dark bg-black/70' : previewTheme === 'light' ? 'bg-white' : ''
        }`}
      >
        <div key={resetKey} className="w-full">
          {renderComponent()}
        </div>
      </div>
    </div>
  );
};
