import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Terminal,
  Check,
  Copy,
  Sparkles,
  Eye,
  Layers,
  X,
} from 'lucide-react';

export interface CatalogComponentItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  categories?: string[];
  subcategory: string;
  version: string;
  price: string;
  style: 'Minimal' | 'Dark' | 'Glass' | 'Editorial';
  badge?: string;
  downloads: string;
  description: string;
  cliCommand: string;
  dependencies: string[];
  props: Array<{ name: string; type: string; default?: string; description: string }>;
  codeSnippet: string;
}

const CATEGORY_COLUMNS: string[][] = [
  ['All', 'Accordions', 'Backgrounds'],
  ['Buttons', 'Cards', 'Carousels'],
  ['Charts', 'Cursors', 'Effects'],
  ['Forms', 'Galleries', 'Interactive'],
  ['Loaders', 'Maps', 'Navigation'],
  ['Players', 'Sections', 'Text'],
];

const AVAILABLE_COMPONENTS: CatalogComponentItem[] = [
  {
    id: 'comp_1',
    slug: 'animated-login-form',
    title: 'Animated Login Form',
    category: 'Forms',
    categories: ['Forms', 'Interactive'],
    subcategory: 'Authentication',
    version: '1.0.0',
    price: 'Free',
    style: 'Dark',
    badge: 'Trending',
    downloads: '1.4k',
    description: 'Spring animated login card with floating labels, tactile validation states, and theme toggling.',
    cliCommand: 'npx vac-ui-components add animated-login-form',
    dependencies: ['motion/react', 'lucide-react'],
    props: [
      { name: 'title', type: 'string', default: '"Welcome Back"', description: 'Top card title' },
      { name: 'subtitle', type: 'string', default: '"Sign in to console"', description: 'Supporting text' },
      { name: 'onSubmit', type: '(data) => Promise<void>', description: 'Form submission handler' },
    ],
    codeSnippet: `import { motion } from "motion/react";
import { Lock, Mail, ArrowRight } from "lucide-react";

export function AnimatedLoginForm({ onSubmit }) {
  return (
    <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 rounded-2xl bg-slate-900 border border-white/10">
      <h3 className="text-xl font-bold text-white mb-4">Welcome Back</h3>
      {/* inputs */}
    </motion.form>
  );
}`,
  },
  {
    id: 'comp_2',
    slug: 'glassmorphism-navbar',
    title: 'Glassmorphism Navbar',
    category: 'Navigation',
    categories: ['Navigation', 'Sections'],
    subcategory: 'Headers',
    version: '1.0.0',
    price: 'Free',
    style: 'Glass',
    badge: 'Popular',
    downloads: '980',
    description: 'Floating frosted navbar with backdrop refraction, blur highlights, and responsive menu.',
    cliCommand: 'npx vac-ui-components add glassmorphism-navbar',
    dependencies: ['motion/react', 'lucide-react'],
    props: [
      { name: 'brandName', type: 'string', default: '"VAC UI"', description: 'Logo brand text' },
      { name: 'links', type: 'Array<{ label, href }>', description: 'Navigation items array' },
    ],
    codeSnippet: `export function GlassmorphismNavbar({ brandName = "VAC UI" }) {
  return (
    <header className="fixed top-4 inset-x-4 max-w-5xl mx-auto h-14 rounded-full bg-white/10 dark:bg-black/40 backdrop-blur-xl border border-white/20 flex items-center justify-between px-6">
      <span className="font-bold text-sm">{brandName}</span>
    </header>
  );
}`,
  },
  {
    id: 'comp_3',
    slug: 'interactive-pricing',
    title: 'Interactive Pricing Tier',
    category: 'Interactive',
    categories: ['Interactive', 'Cards', 'Sections'],
    subcategory: 'Pricing',
    version: '1.0.0',
    price: 'Free',
    style: 'Minimal',
    badge: 'Staff Pick',
    downloads: '870',
    description: 'Tiered subscription table with annual discount calculation and conversion call-to-actions.',
    cliCommand: 'npx vac-ui-components add interactive-pricing',
    dependencies: ['motion/react', 'lucide-react'],
    props: [
      { name: 'defaultPeriod', type: '"monthly" | "yearly"', default: '"yearly"', description: 'Initial billing cycle' },
    ],
    codeSnippet: `export function InteractivePricing() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Tier cards with monthly/yearly pricing switch */}
    </div>
  );
}`,
  },
  {
    id: 'comp_4',
    slug: 'analytics-dashboard',
    title: 'Analytics Metrics Matrix',
    category: 'Charts',
    categories: ['Charts', 'Sections'],
    subcategory: 'Metrics',
    version: '1.0.0',
    price: 'Free',
    style: 'Dark',
    badge: 'New',
    downloads: '1.2k',
    description: 'Real-time telemetry metric cards with sparkline growth indicators and time range filtering.',
    cliCommand: 'npx vac-ui-components add analytics-dashboard',
    dependencies: ['lucide-react'],
    props: [
      { name: 'metrics', type: 'Array<MetricItem>', description: 'Telemetry stat cards' },
    ],
    codeSnippet: `export function AnalyticsDashboard({ metrics }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Metric panels with sparklines */}
    </div>
  );
}`,
  },
  {
    id: 'comp_5',
    slug: 'notification-center',
    title: 'Notification Center Feed',
    category: 'Loaders',
    categories: ['Loaders', 'Effects', 'Interactive'],
    subcategory: 'Alerts',
    version: '1.0.0',
    price: 'Free',
    style: 'Editorial',
    downloads: '760',
    description: 'Actionable alert feed with read/unread markers, category tabs, and mark-all-read shortcuts.',
    cliCommand: 'npx vac-ui-components add notification-center',
    dependencies: ['motion/react', 'lucide-react'],
    props: [
      { name: 'unreadCount', type: 'number', default: '3', description: 'Pending badge indicator' },
    ],
    codeSnippet: `export function NotificationCenter({ unreadCount }) {
  return (
    <div className="w-80 rounded-2xl bg-white dark:bg-slate-900 border p-4 shadow-xl">
      {/* Alert items */}
    </div>
  );
}`,
  },
  {
    id: 'comp_6',
    slug: 'file-upload',
    title: 'Drag & Drop File Upload',
    category: 'Forms',
    categories: ['Forms', 'Loaders', 'Interactive'],
    subcategory: 'File Inputs',
    version: '1.0.0',
    price: 'Free',
    style: 'Minimal',
    downloads: '1.1k',
    description: 'Dropzone with file type validation, size safeguards, file cards, and progress animations.',
    cliCommand: 'npx vac-ui-components add file-upload',
    dependencies: ['motion/react', 'lucide-react'],
    props: [
      { name: 'maxSizeMb', type: 'number', default: '25', description: 'Upload boundary safeguard' },
      { name: 'onUpload', type: '(files) => void', description: 'File drop callback' },
    ],
    codeSnippet: `export function FileUpload({ maxSizeMb = 25, onUpload }) {
  return (
    <div className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer">
      <p className="text-xs text-gray-500">Drag files here up to {maxSizeMb}MB</p>
    </div>
  );
}`,
  },
  {
    id: 'comp_7',
    slug: 'glass-button',
    title: 'Glass Pill Button',
    category: 'Buttons',
    categories: ['Buttons', 'Effects'],
    subcategory: 'Pills',
    version: '1.0.0',
    price: 'Free',
    style: 'Glass',
    downloads: '640',
    description: 'Frosted glass pill button with subtle reflection highlights and tactile spring animation.',
    cliCommand: 'npx vac-ui-components add glass-button',
    dependencies: ['motion/react'],
    props: [{ name: 'children', type: 'ReactNode', description: 'Button text or icon' }],
    codeSnippet: `export function GlassButton({ children }) {
  return (
    <button className="px-6 py-2.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 text-white font-medium text-xs shadow-lg">
      {children}
    </button>
  );
}`,
  },
  {
    id: 'comp_8',
    slug: 'toggle-switch',
    title: 'Animated Toggle Switch',
    category: 'Buttons',
    categories: ['Buttons', 'Interactive'],
    subcategory: 'Switches',
    version: '1.0.0',
    price: 'Free',
    style: 'Minimal',
    downloads: '920',
    description: 'Smooth sliding toggle switch with active glow state and accessible keyboard support.',
    cliCommand: 'npx vac-ui-components add toggle-switch',
    dependencies: ['motion/react'],
    props: [{ name: 'checked', type: 'boolean', default: 'true', description: 'Toggle state' }],
    codeSnippet: `export function ToggleSwitch({ checked, onChange }) {
  return (
    <div className="w-12 h-6 bg-purple-600 rounded-full p-1 cursor-pointer">
      <div className="w-4 h-4 bg-white rounded-full shadow-md" />
    </div>
  );
}`,
  },
  {
    id: 'comp_9',
    slug: 'dark-glass-card',
    title: 'Spotlight Ambient Card',
    category: 'Cards',
    categories: ['Cards', 'Backgrounds', 'Effects'],
    subcategory: 'Containers',
    version: '1.0.0',
    price: 'Free',
    style: 'Dark',
    downloads: '810',
    description: 'Deep translucent component card with mouse-tracking radial ambient illumination.',
    cliCommand: 'npx vac-ui-components add dark-glass-card',
    dependencies: ['lucide-react'],
    props: [{ name: 'title', type: 'string', description: 'Card headline' }],
    codeSnippet: `export function DarkGlassCard({ title }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl p-6 text-white shadow-2xl">
      <h4 className="font-bold text-sm">{title}</h4>
    </div>
  );
}`,
  },
];

export const ComponentsCatalogPage: React.FC = () => {
  const { slug: routeSlug } = useParams<{ slug?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const querySlug = searchParams.get('slug') || searchParams.get('component');
  const targetSlug = routeSlug || querySlug;
  const categoryParam = searchParams.get('category');

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [inspectingComponent, setInspectingComponent] = useState<CatalogComponentItem | null>(null);

  const normalizeCategory = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes('form') || c.includes('auth')) return 'Forms';
    if (c.includes('nav')) return 'Navigation';
    if (c.includes('button')) return 'Buttons';
    if (c.includes('card')) return 'Cards';
    if (c.includes('chart') || c.includes('data') || c.includes('dash')) return 'Charts';
    if (c.includes('pricing') || c.includes('market') || c.includes('interact')) return 'Interactive';
    if (c.includes('feed') || c.includes('alert') || c.includes('load') || c.includes('overlay')) return 'Loaders';
    return cat;
  };

  useEffect(() => {
    if (targetSlug) {
      const match = AVAILABLE_COMPONENTS.find(
        (c) => c.slug.toLowerCase() === targetSlug.toLowerCase()
      );
      if (match) {
        setSelectedCategory(match.category);
        setSelectedSlug(match.slug);
        setInspectingComponent(match);
      }
    } else if (categoryParam) {
      setSelectedCategory(normalizeCategory(categoryParam));
    }
  }, [targetSlug, categoryParam]);

  const handleCloseInspector = () => {
    setInspectingComponent(null);
    if (routeSlug) {
      navigate('/components', { replace: true });
    }
  };

  const copyCli = (command: string, slug: string) => {
    navigator.clipboard.writeText(command);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const filteredComponents = AVAILABLE_COMPONENTS.filter((comp) => {
    if (selectedSlug && comp.slug !== selectedSlug) {
      return false;
    }
    if (selectedCategory && selectedCategory !== 'All') {
      const targetCat = selectedCategory.toLowerCase();
      const matchCategory =
        comp.category.toLowerCase() === targetCat ||
        comp.categories?.some((c) => c.toLowerCase() === targetCat) ||
        (targetCat === 'forms' && (comp.category.includes('Form') || comp.category.includes('Auth'))) ||
        (targetCat === 'buttons' && comp.category.includes('Button')) ||
        (targetCat === 'cards' && comp.category.includes('Card')) ||
        (targetCat === 'charts' && (comp.category.includes('Chart') || comp.category.includes('Data') || comp.category.includes('Dash'))) ||
        (targetCat === 'navigation' && comp.category.includes('Nav')) ||
        (targetCat === 'loaders' && (comp.category.includes('Load') || comp.category.includes('Feed') || comp.category.includes('Alert') || comp.category.includes('Overlay')));
      if (!matchCategory) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="min-h-full bg-[#F8F9FC] dark:bg-[#0A0B10] text-[#161722] dark:text-[#E4E4E7] px-6 sm:px-10 lg:px-14 py-10 transition-colors duration-200 selection:bg-purple-500/30">
      <div className="max-w-[1560px] mx-auto space-y-8">
        
        {/* ============================================================== */}
        {/* HEADER SECTION (Component Catalog)                            */}
        {/* ============================================================== */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[#5B4FF5] text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>VAC-UI-COMPONENTS · Official Library</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#161722] dark:text-white transition-colors">
            UI Components
          </h1>
          <p className="text-sm text-[#6B7280] dark:text-[#8E8F99] max-w-2xl leading-relaxed font-normal transition-colors">
            Production-ready React components built with TypeScript, Tailwind CSS, and Motion.
            Inspect properties, copy source code, or install directly using the VAC CLI.
          </p>
        </div>

        {/* ============================================================== */}
        {/* CATEGORIES GRID (Exact 6-column layout matching reference)     */}
        {/* ============================================================== */}
        <div className="pt-2 pb-8 border-b border-[#E8EAEF] dark:border-white/[0.08] transition-colors">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-4">
            {CATEGORY_COLUMNS.map((column, colIdx) => (
              <div key={colIdx} className="space-y-3.5">
                {column.map((cat) => {
                  const isActive = (selectedCategory === null && cat === 'All') || selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        if (cat === 'All') {
                          setSelectedCategory(null);
                          setSelectedSlug(null);
                        } else if (selectedCategory === cat) {
                          setSelectedCategory(null);
                          setSelectedSlug(null);
                        } else {
                          setSelectedCategory(cat);
                          setSelectedSlug(null);
                        }
                      }}
                      className={`block text-left text-sm sm:text-[15px] transition-colors duration-150 cursor-pointer select-none group ${
                        isActive
                          ? 'text-[#161722] dark:text-white font-semibold'
                          : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#161722] dark:hover:text-white font-normal'
                      }`}
                    >
                      {isActive ? (
                        <span className="flex items-center gap-1.5">
                          <span className="text-[#5B4FF5] dark:text-white text-base leading-none font-bold">•</span>
                          <span>{cat}</span>
                        </span>
                      ) : (
                        <span>{cat}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* ============================================================== */}
        {/* COMPONENT CARDS GRID (Cards view only, heading & copy button)  */}
        {/* ============================================================== */}
        {filteredComponents.length === 0 ? (
          <div className="rounded-2xl bg-white dark:bg-white/[0.03] border border-dashed border-[#E8EAEF] dark:border-white/10 p-12 text-center space-y-3">
            <Layers className="w-8 h-8 text-gray-400 mx-auto" />
            <h3 className="text-base font-semibold text-[#161722] dark:text-white">
              {selectedCategory
                ? `No components in "${selectedCategory}" yet`
                : 'No components available'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              {selectedCategory
                ? `The "${selectedCategory}" collection is scheduled for our upcoming release. Explore other categories or view all components.`
                : 'Explore other categories or click below to view all components.'}
            </p>
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSelectedSlug(null);
              }}
              className="px-4 py-2 rounded-full bg-[#181A25] dark:bg-white/[0.1] text-white text-xs font-medium hover:bg-black transition-all cursor-pointer"
            >
              View All Components
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {filteredComponents.map((item) => (
              <div
                key={item.id}
                onClick={() => setInspectingComponent(item)}
                className="group rounded-2xl bg-white dark:bg-white/[0.03] border border-[#E8EAEF] dark:border-white/[0.07] hover:border-[#5B4FF5]/50 dark:hover:border-white/[0.2] transition-all overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md cursor-pointer"
              >
                {/* Preview Thumbnail Container */}
                <div className="relative aspect-[16/10] bg-[#F5F6FA] dark:bg-black/50 overflow-hidden border-b border-[#E8EAEF] dark:border-white/[0.05]">
                  <div className="absolute inset-0 p-5 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#5B4FF5] bg-[#5B4FF5]/10 border border-[#5B4FF5]/20 px-2.5 py-0.5 rounded-full font-medium">
                        {item.subcategory}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500">
                        v{item.version}
                      </span>
                    </div>

                    {/* Mock Wireframe Preview */}
                    <div className="w-full h-24 rounded-xl bg-white dark:bg-white/[0.05] border border-gray-200/70 dark:border-white/10 p-3 flex flex-col justify-between shadow-xs group-hover:scale-[1.02] transition-transform">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
                        <div className="h-2 w-16 bg-gray-200 dark:bg-white/10 rounded-full ml-auto" />
                      </div>
                      <div className="space-y-1.5 py-1">
                        <div className="h-3 w-3/4 bg-gray-300/80 dark:bg-white/20 rounded-md" />
                        <div className="h-2 w-1/2 bg-gray-200 dark:bg-white/10 rounded-md" />
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <div className="h-3 w-14 bg-[#5B4FF5]/30 rounded-full" />
                        <div className="h-2.5 w-8 bg-gray-200 dark:bg-white/10 rounded-full" />
                      </div>
                    </div>

                    {/* Hover Inspect Action */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                      <span className="px-4 py-1.5 rounded-full bg-white text-black text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Details</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Content: ONLY Heading and Copy Button (downloads count, description, and price removed) */}
                <div className="p-4 flex items-center justify-between gap-3">
                  <h4 className="text-xs font-semibold text-[#161722] dark:text-white group-hover:text-[#5B4FF5] transition-colors truncate">
                    {item.title}
                  </h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyCli(item.cliCommand, item.slug);
                    }}
                    className="shrink-0 px-3.5 py-1.5 rounded-full bg-[#181A25] hover:bg-black dark:bg-white/[0.1] dark:hover:bg-white/[0.2] text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    title={`Copy "${item.cliCommand}"`}
                  >
                    {copiedSlug === item.slug ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Terminal className="w-3.5 h-3.5 text-purple-300" />
                        <span>Copy CLI</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ============================================================== */}
      {/* COMPONENT INSPECT MODAL / DRAWER                               */}
      {/* ============================================================== */}
      {inspectingComponent && (
        <div
          onClick={handleCloseInspector}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-white dark:bg-[#11131A] rounded-3xl p-6 shadow-2xl border border-[#E8EAEF] dark:border-white/10 space-y-5 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between pb-3 border-b border-[#E8EAEF] dark:border-white/10">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#5B4FF5] bg-[#5B4FF5]/10 px-2.5 py-0.5 rounded-full font-medium">
                  {inspectingComponent.category} · {inspectingComponent.subcategory}
                </span>
                <h3 className="text-xl font-bold text-[#161722] dark:text-white mt-1">
                  {inspectingComponent.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {inspectingComponent.description}
                </p>
              </div>
              <button
                onClick={handleCloseInspector}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Install Command */}
            <div className="p-3 rounded-2xl bg-gray-50 dark:bg-black/40 border border-gray-200/80 dark:border-white/10 flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Terminal className="w-4 h-4 text-[#5B4FF5]" />
                <span>{inspectingComponent.cliCommand}</span>
              </div>
              <button
                onClick={() => copyCli(inspectingComponent.cliCommand, inspectingComponent.slug)}
                className="px-3 py-1 rounded-full bg-[#181A25] hover:bg-black text-white text-[11px] font-sans font-medium flex items-center gap-1 transition-all"
              >
                {copiedSlug === inspectingComponent.slug ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Props Table */}
            <div>
              <h4 className="text-xs font-semibold text-[#161722] dark:text-white uppercase tracking-wider mb-2">
                Supported Props
              </h4>
              <div className="rounded-xl border border-[#E8EAEF] dark:border-white/10 overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-white/[0.03] text-gray-500 border-b border-[#E8EAEF] dark:border-white/10">
                    <tr>
                      <th className="p-2.5 font-medium">Prop</th>
                      <th className="p-2.5 font-medium">Type</th>
                      <th className="p-2.5 font-medium">Default</th>
                      <th className="p-2.5 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8EAEF] dark:divide-white/[0.05]">
                    {inspectingComponent.props.map((p) => (
                      <tr key={p.name}>
                        <td className="p-2.5 font-mono text-[#5B4FF5]">{p.name}</td>
                        <td className="p-2.5 font-mono text-gray-500">{p.type}</td>
                        <td className="p-2.5 font-mono text-gray-400">{p.default || '-'}</td>
                        <td className="p-2.5 text-gray-600 dark:text-gray-300">{p.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Code Snippet Tab */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-[#161722] dark:text-white uppercase tracking-wider">
                  Source Code
                </h4>
                <button
                  onClick={() => copyCli(inspectingComponent.codeSnippet, 'code')}
                  className="text-xs text-[#5B4FF5] hover:underline flex items-center gap-1 font-medium"
                >
                  <Copy className="w-3 h-3" /> Copy Snippet
                </button>
              </div>
              <pre className="p-4 rounded-2xl bg-gray-900 text-gray-200 text-xs font-mono overflow-x-auto border border-gray-800">
                <code>{inspectingComponent.codeSnippet}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
