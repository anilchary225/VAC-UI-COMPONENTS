import React, { useState } from 'react';
import {
  ChevronDown,
  Terminal,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Eye,
  Code2,
  LayoutGrid,
  List,
  Layers,
  X,
  Lock,
  Compass,
  FileCode,
  ShieldCheck,
  Search,
  CreditCard,
  BarChart2,
  Bell,
  Sliders,
} from 'lucide-react';

export interface CatalogComponentItem {
  id: string;
  slug: string;
  title: string;
  category: string;
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

export interface ComponentCategoryGroup {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

const COMPONENT_CATEGORIES: ComponentCategoryGroup[] = [
  { name: 'Forms & Auth', icon: Lock },
  { name: 'Navigation', icon: Compass },
  { name: 'Marketing & Pricing', icon: CreditCard },
  { name: 'Data & Dashboards', icon: BarChart2 },
  { name: 'Feedback & Overlays', icon: Bell },
  { name: 'Buttons & Controls', icon: Sliders },
  { name: 'Cards & Surfaces', icon: Layers },
];

const AVAILABLE_COMPONENTS: CatalogComponentItem[] = [
  {
    id: 'comp_1',
    slug: 'animated-login-form',
    title: 'Animated Login Form',
    category: 'Forms & Auth',
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
    category: 'Marketing & Pricing',
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
    category: 'Data & Dashboards',
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
    category: 'Feedback & Overlays',
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
    category: 'Forms & Auth',
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
    category: 'Buttons & Controls',
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
    category: 'Buttons & Controls',
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
    category: 'Cards & Surfaces',
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [activeSort, setActiveSort] = useState<'Trending' | 'Best' | 'Recent'>('Trending');
  const [priceFilter, setPriceFilter] = useState<'All' | 'Free' | 'Pro'>('All');
  const [styleFilter, setStyleFilter] = useState<'All' | 'Minimal' | 'Dark' | 'Glass' | 'Editorial'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [inspectingComponent, setInspectingComponent] = useState<CatalogComponentItem | null>(null);

  const copyCli = (command: string, slug: string) => {
    navigator.clipboard.writeText(command);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const filteredComponents = AVAILABLE_COMPONENTS.filter((comp) => {
    if (selectedSlug && comp.slug !== selectedSlug) {
      return false;
    }
    if (selectedCategory && comp.category !== selectedCategory) {
      return false;
    }
    if (priceFilter !== 'All' && comp.price !== priceFilter) {
      return false;
    }
    if (styleFilter !== 'All' && comp.style !== styleFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        comp.title.toLowerCase().includes(q) ||
        comp.description.toLowerCase().includes(q) ||
        comp.category.toLowerCase().includes(q) ||
        comp.subcategory.toLowerCase().includes(q) ||
        comp.cliCommand.toLowerCase().includes(q) ||
        comp.dependencies.some((d) => d.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="min-h-full bg-[#F8F9FC] dark:bg-[#0A0B10] text-[#161722] dark:text-[#E4E4E7] px-6 sm:px-10 lg:px-14 py-10 transition-colors duration-200 selection:bg-purple-500/30">
      <div className="max-w-[1560px] mx-auto space-y-10">
        
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
        {/* COMPONENT CATEGORIES (Show only headings, click to filter)     */}
        {/* ============================================================== */}
        <div className="pt-1 pb-6 border-b border-[#E8EAEF] dark:border-white/[0.08] transition-colors space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] dark:text-[#8E8F99]">
              Categories {selectedCategory && <span className="text-[#5B4FF5] font-bold">· Filtered by {selectedCategory}</span>}
            </span>
            {selectedCategory && (
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedSlug(null);
                }}
                className="text-xs text-[#5B4FF5] hover:underline font-medium"
              >
                Reset to All ({AVAILABLE_COMPONENTS.length})
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* All Components heading button */}
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSelectedSlug(null);
              }}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all duration-150 border cursor-pointer select-none ${
                selectedCategory === null
                  ? 'bg-[#5B4FF5] text-white border-[#5B4FF5] shadow-sm shadow-[#5B4FF5]/25'
                  : 'bg-white dark:bg-white/[0.04] text-[#161722] dark:text-[#E4E4E7] border-[#E8EAEF] dark:border-white/[0.08] hover:border-[#5B4FF5]/40 hover:bg-[#5B4FF5]/5 dark:hover:bg-white/[0.08]'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${selectedCategory === null ? 'text-white' : 'text-[#5B4FF5]'}`} />
              <span>All Components</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                  selectedCategory === null
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 dark:bg-white/[0.08] text-gray-500 dark:text-gray-400'
                }`}
              >
                {AVAILABLE_COMPONENTS.length}
              </span>
            </button>

            {COMPONENT_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isCategoryActive = selectedCategory === cat.name;
              const count = AVAILABLE_COMPONENTS.filter((c) => c.category === cat.name).length;
              return (
                <button
                  key={cat.name}
                  onClick={() => {
                    if (selectedCategory === cat.name) {
                      setSelectedCategory(null);
                      setSelectedSlug(null);
                    } else {
                      setSelectedCategory(cat.name);
                      setSelectedSlug(null);
                    }
                  }}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all duration-150 border cursor-pointer select-none ${
                    isCategoryActive
                      ? 'bg-[#5B4FF5] text-white border-[#5B4FF5] shadow-sm shadow-[#5B4FF5]/25'
                      : 'bg-white dark:bg-white/[0.04] text-[#161722] dark:text-[#E4E4E7] border-[#E8EAEF] dark:border-white/[0.08] hover:border-[#5B4FF5]/40 hover:text-[#5B4FF5] dark:hover:text-white hover:bg-[#5B4FF5]/5 dark:hover:bg-white/[0.08]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isCategoryActive ? 'text-white' : 'text-[#5B4FF5]'}`} />
                  <span>{cat.name}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                      isCategoryActive
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 dark:bg-white/[0.08] text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ============================================================== */}
        {/* CONTROLS BAR: Sort pills + Search + Dropdowns + Grid/List View */}
        {/* ============================================================== */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          {/* Left sort pills & search */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-1 p-1 rounded-full bg-white dark:bg-white/[0.04] border border-[#E8EAEF] dark:border-white/[0.06] shadow-xs transition-colors">
              {(['Trending', 'Best', 'Recent'] as const).map((tab) => {
                const isActive = activeSort === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveSort(tab)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#181A25] text-white dark:bg-white/[0.12] dark:text-white shadow-xs'
                        : 'text-[#6B7280] dark:text-[#8E8F99] hover:text-[#161722] dark:hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Quick search input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search available components..."
                className="bg-white dark:bg-white/[0.04] hover:bg-gray-50 dark:hover:bg-white/[0.07] border border-[#E8EAEF] dark:border-white/[0.08] text-[#161722] dark:text-white text-xs rounded-full pl-8 pr-7 py-1.5 focus:outline-none focus:border-[#5B4FF5] w-52 sm:w-64 placeholder-gray-400 font-normal transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Right filters & View Mode Toggle */}
          <div className="flex items-center gap-2.5">
            {(selectedCategory || selectedSlug) && (
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedSlug(null);
                }}
                className="text-xs text-[#5B4FF5] hover:underline font-medium mr-2"
              >
                Clear filter ({selectedSlug ? AVAILABLE_COMPONENTS.find(c => c.slug === selectedSlug)?.title : selectedCategory}) ✕
              </button>
            )}

            {/* Price Dropdown */}
            <div className="relative">
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value as any)}
                className="appearance-none bg-white dark:bg-[#181A20] hover:bg-gray-50 dark:hover:bg-white/[0.07] border border-[#E8EAEF] dark:border-white/[0.08] text-[#161722] dark:text-white text-xs rounded-full pl-4 pr-8 py-1.5 focus:outline-none focus:border-[#5B4FF5] cursor-pointer font-medium shadow-xs transition-colors"
              >
                <option value="All" className="bg-white dark:bg-[#181A20] text-[#161722] dark:text-white">Price: All</option>
                <option value="Free" className="bg-white dark:bg-[#181A20] text-[#161722] dark:text-white">Free</option>
                <option value="Pro" className="bg-white dark:bg-[#181A20] text-[#161722] dark:text-white">Pro</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Style Dropdown */}
            <div className="relative">
              <select
                value={styleFilter}
                onChange={(e) => setStyleFilter(e.target.value as any)}
                className="appearance-none bg-white dark:bg-[#181A20] hover:bg-gray-50 dark:hover:bg-white/[0.07] border border-[#E8EAEF] dark:border-white/[0.08] text-[#161722] dark:text-white text-xs rounded-full pl-4 pr-8 py-1.5 focus:outline-none focus:border-[#5B4FF5] cursor-pointer font-medium shadow-xs transition-colors"
              >
                <option value="All" className="bg-white dark:bg-[#181A20] text-[#161722] dark:text-white">Style: All</option>
                <option value="Dark" className="bg-white dark:bg-[#181A20] text-[#161722] dark:text-white">Dark</option>
                <option value="Minimal" className="bg-white dark:bg-[#181A20] text-[#161722] dark:text-white">Minimal</option>
                <option value="Glass" className="bg-white dark:bg-[#181A20] text-[#161722] dark:text-white">Glass</option>
                <option value="Editorial" className="bg-white dark:bg-[#181A20] text-[#161722] dark:text-white">Editorial</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Grid vs List View Switcher */}
            <div className="flex items-center rounded-full p-1 bg-white dark:bg-white/[0.04] border border-[#E8EAEF] dark:border-white/[0.08] shadow-xs">
              <button
                onClick={() => setViewMode('list')}
                title="Available Components List View"
                className={`p-1.5 rounded-full transition-all ${
                  viewMode === 'list'
                    ? 'bg-[#181A25] text-white dark:bg-white/[0.15] dark:text-white'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                title="Card Grid View"
                className={`p-1.5 rounded-full transition-all ${
                  viewMode === 'grid'
                    ? 'bg-[#181A25] text-white dark:bg-white/[0.15] dark:text-white'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* COMPONENT PRESENTATION: Grid View or List View                 */}
        {/* ============================================================== */}
        {filteredComponents.length === 0 ? (
          <div className="rounded-2xl bg-white dark:bg-white/[0.03] border border-dashed border-[#E8EAEF] dark:border-white/10 p-12 text-center space-y-3">
            <Layers className="w-8 h-8 text-gray-400 mx-auto" />
            <h3 className="text-base font-semibold text-[#161722] dark:text-white">
              No components match your search filters
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              Try adjusting your query, clearing category selections, or resetting style filters.
            </p>
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSelectedSlug(null);
                setSearchQuery('');
                setPriceFilter('All');
                setStyleFilter('All');
              }}
              className="px-4 py-2 rounded-full bg-[#181A25] dark:bg-white/[0.1] text-white text-xs font-medium hover:bg-black transition-all"
            >
              Reset All Filters
            </button>
          </div>
        ) : viewMode === 'list' ? (
          /* List View (Available Components Detailed List) */
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
              <span className="font-medium">
                Showing <strong className="text-[#161722] dark:text-white">{filteredComponents.length}</strong> available components in catalog
              </span>
              <span className="text-[11px] font-mono">
                {selectedSlug
                  ? `Component: ${AVAILABLE_COMPONENTS.find(c => c.slug === selectedSlug)?.title}`
                  : selectedCategory
                  ? `Category: ${selectedCategory}`
                  : 'All Categories'} · Click 'Inspect' for props & code
              </span>
            </div>

            <div className="rounded-2xl bg-white dark:bg-white/[0.03] border border-[#E8EAEF] dark:border-white/[0.07] overflow-hidden shadow-xs transition-colors">
              <div className="grid grid-cols-12 gap-3 px-5 py-3.5 bg-gray-50/70 dark:bg-white/[0.02] border-b border-[#E8EAEF] dark:border-white/10 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="col-span-12 md:col-span-4">Component & Details</div>
                <div className="hidden md:block md:col-span-2">Category</div>
                <div className="hidden md:block md:col-span-1">Style</div>
                <div className="hidden md:block md:col-span-2">Dependencies</div>
                <div className="hidden md:block md:col-span-2">Quick Install CLI</div>
                <div className="col-span-12 md:col-span-1 text-right">Actions</div>
              </div>

              <div className="divide-y divide-[#E8EAEF] dark:divide-white/[0.05]">
                {filteredComponents.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-3 px-5 py-4 items-center text-xs hover:bg-gray-50/80 dark:hover:bg-white/[0.025] transition-colors group"
                  >
                    {/* Component Title, Description & Badge */}
                    <div className="col-span-12 md:col-span-4 flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-[#5B4FF5] flex items-center justify-center shrink-0 border border-purple-200/50 dark:border-purple-500/20 mt-0.5 group-hover:scale-105 transition-transform">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-[#161722] dark:text-white text-sm group-hover:text-[#5B4FF5] transition-colors truncate">
                            {item.title}
                          </h4>
                          <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400">
                            v{item.version}
                          </span>
                          {item.badge && (
                            <span className="text-[10px] font-medium px-2 py-0.2 rounded-full bg-purple-100 dark:bg-purple-500/20 text-[#5B4FF5] dark:text-purple-300">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#6B7280] dark:text-[#8E8F99] line-clamp-1 mt-0.5 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Category & Subcategory */}
                    <div className="hidden md:block md:col-span-2">
                      <button
                        onClick={() => {
                          setSelectedCategory(item.category);
                          setSelectedSlug(null);
                        }}
                        className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-purple-50 hover:text-[#5B4FF5] dark:hover:bg-purple-500/10 dark:hover:text-purple-300 transition-colors border border-gray-200/60 dark:border-white/5"
                        title={`Filter by ${item.category}`}
                      >
                        {item.category} · {item.subcategory}
                      </button>
                    </div>

                    {/* Style */}
                    <div className="hidden md:block md:col-span-1">
                      <span className="inline-flex items-center gap-1.5 text-xs text-[#161722] dark:text-gray-200 font-medium">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          item.style === 'Dark'
                            ? 'bg-purple-400'
                            : item.style === 'Glass'
                            ? 'bg-cyan-400'
                            : item.style === 'Editorial'
                            ? 'bg-amber-400'
                            : 'bg-emerald-400'
                        }`} />
                        {item.style}
                      </span>
                    </div>

                    {/* Dependencies */}
                    <div className="hidden md:block md:col-span-2">
                      <div className="flex items-center gap-1 flex-wrap">
                        {item.dependencies.map((dep) => (
                          <span
                            key={dep}
                            className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-gray-200/50 dark:border-white/5"
                          >
                            {dep}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* CLI Command */}
                    <div className="hidden md:block md:col-span-2">
                      <button
                        onClick={() => copyCli(item.cliCommand, item.slug)}
                        className="w-full font-mono text-[11px] bg-gray-100 dark:bg-black/40 hover:bg-gray-200 dark:hover:bg-black/60 px-2.5 py-1.5 rounded-xl text-gray-700 dark:text-gray-300 flex items-center justify-between transition-colors border border-gray-200/60 dark:border-white/10 group/btn"
                        title="Click to copy CLI command"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <Terminal className="w-3 h-3 text-[#5B4FF5] shrink-0" />
                          <span className="truncate">{item.cliCommand}</span>
                        </div>
                        {copiedSlug === item.slug ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 ml-1.5" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-gray-400 group-hover/btn:text-gray-600 dark:group-hover/btn:text-white shrink-0 ml-1.5" />
                        )}
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="col-span-12 md:col-span-1 text-right flex md:block items-center justify-between">
                      <div className="md:hidden flex items-center gap-2">
                        <button
                          onClick={() => copyCli(item.cliCommand, item.slug)}
                          className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-white/5 text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1"
                        >
                          <Terminal className="w-3 h-3 text-[#5B4FF5]" />
                          <span>Copy CLI</span>
                        </button>
                      </div>
                      <button
                        onClick={() => setInspectingComponent(item)}
                        className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-[#5B4FF5] text-[#5B4FF5] hover:text-white dark:bg-white/5 dark:hover:bg-[#5B4FF5] dark:text-purple-300 dark:hover:text-white font-semibold text-xs inline-flex items-center gap-1 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {filteredComponents.map((item) => (
              <div
                key={item.id}
                className="group rounded-2xl bg-white dark:bg-white/[0.03] border border-[#E8EAEF] dark:border-white/[0.07] hover:border-[#5B4FF5]/50 dark:hover:border-white/[0.2] transition-all overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md"
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

                    {/* Hover Actions */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center gap-2.5 p-4">
                      <button
                        onClick={() => copyCli(item.cliCommand, item.slug)}
                        className="px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-medium border border-white/20 flex items-center gap-1.5 transition-all"
                      >
                        {copiedSlug === item.slug ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Terminal className="w-3.5 h-3.5 text-purple-300" />
                            <span>Copy CLI</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setInspectingComponent(item)}
                        className="px-4 py-1.5 rounded-full bg-white text-black hover:bg-gray-100 text-xs font-semibold flex items-center gap-1 transition-all shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Meta Footer */}
                <div className="p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[#161722] dark:text-white group-hover:text-[#5B4FF5] transition-colors">
                      {item.title}
                    </h4>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {item.price}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7280] dark:text-[#8E8F99] line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                  <div className="pt-2 flex items-center justify-between text-[11px] text-gray-400 font-mono">
                    <span>{item.downloads} downloads</span>
                    <button
                      onClick={() => setInspectingComponent(item)}
                      className="text-[#5B4FF5] hover:underline flex items-center gap-0.5"
                    >
                      Props & Code <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-[#11131A] rounded-3xl p-6 shadow-2xl border border-[#E8EAEF] dark:border-white/10 space-y-5 max-h-[90vh] overflow-y-auto">
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
                onClick={() => setInspectingComponent(null)}
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
