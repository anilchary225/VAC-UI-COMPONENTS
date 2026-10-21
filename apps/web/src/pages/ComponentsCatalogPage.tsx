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
} from 'lucide-react';

interface ComponentTemplateItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  subcategory: string;
  price: string;
  style: 'Minimal' | 'Dark' | 'Glass' | 'Editorial';
  badge?: string;
  downloads: string;
  previewUrl: string;
  description: string;
  cliCommand: string;
}

const CATEGORY_COLUMNS = [
  {
    name: 'Portfolio',
    items: ['Artists', 'Designers', 'Photography', 'Resume'],
  },
  {
    name: 'Software',
    items: ['AI', 'Apps', 'Fintech', 'SaaS'],
  },
  {
    name: 'Agency',
    items: ['Architecture', 'Design', 'Marketing', 'Web'],
  },
  {
    name: 'Ecommerce',
    items: ['Beauty', 'Digital', 'Fashion', 'Furniture'],
  },
  {
    name: 'Services',
    items: ['Consulting', 'Education', 'Home', 'Legal'],
  },
  {
    name: 'Health',
    items: ['Fitness', 'Medical', 'Therapy', 'Wellness'],
  },
  {
    name: 'Publishing',
    items: ['Blogs', 'Entertainment', 'Magazines', 'News'],
  },
  {
    name: 'Real Estate',
    items: ['Agents', 'Construction', 'Listings', 'Management'],
  },
  {
    name: 'Hospitality',
    items: ['Food', 'Hotels', 'Restaurants', 'Travel'],
  },
  {
    name: 'Events',
    items: ['Conferences', 'Music', 'Sports', 'Weddings'],
  },
];

const TEMPLATE_COMPONENTS: ComponentTemplateItem[] = [
  {
    id: 'comp_1',
    slug: 'animated-login-form',
    title: 'Animated Login Form',
    category: 'Software',
    subcategory: 'AI',
    price: 'Free',
    style: 'Dark',
    badge: 'Trending',
    downloads: '1.4k',
    previewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    description: 'Spring animated login card with floating labels, tactile validation states, and theme toggling.',
    cliCommand: 'npx vac-ui-components add animated-login-form',
  },
  {
    id: 'comp_2',
    slug: 'glassmorphism-navbar',
    title: 'Glassmorphism Navbar',
    category: 'Agency',
    subcategory: 'Design',
    price: 'Free',
    style: 'Glass',
    badge: 'Popular',
    downloads: '980',
    previewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    description: 'Floating frosted navbar with backdrop refraction and responsive collapsible navigation.',
    cliCommand: 'npx vac-ui-components add glassmorphism-navbar',
  },
  {
    id: 'comp_3',
    slug: 'interactive-pricing',
    title: 'Interactive Pricing Tier',
    category: 'Software',
    subcategory: 'SaaS',
    price: 'Free',
    style: 'Minimal',
    badge: 'Staff Pick',
    downloads: '870',
    previewUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
    description: 'Tiered subscription table with monthly/annual switch and feature highlight badges.',
    cliCommand: 'npx vac-ui-components add interactive-pricing',
  },
  {
    id: 'comp_4',
    slug: 'analytics-dashboard',
    title: 'Analytics Metrics Matrix',
    category: 'Software',
    subcategory: 'Fintech',
    price: 'Free',
    style: 'Dark',
    badge: 'New',
    downloads: '1.2k',
    previewUrl: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&auto=format&fit=crop&q=80',
    description: 'Real-time telemetry metric cards with sparkline growth charts and time range filtering.',
    cliCommand: 'npx vac-ui-components add analytics-dashboard',
  },
  {
    id: 'comp_5',
    slug: 'notification-center',
    title: 'Notification Center Feed',
    category: 'Software',
    subcategory: 'Apps',
    price: 'Free',
    style: 'Editorial',
    downloads: '760',
    previewUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80',
    description: 'Actionable alert feed with read/unread markers, category tabs, and mark-all-read actions.',
    cliCommand: 'npx vac-ui-components add notification-center',
  },
  {
    id: 'comp_6',
    slug: 'file-upload',
    title: 'Drag & Drop File Upload',
    category: 'Portfolio',
    subcategory: 'Designers',
    price: 'Free',
    style: 'Minimal',
    downloads: '1.1k',
    previewUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
    description: 'Dropzone with instant file type validation, size safeguards, and animated progress bars.',
    cliCommand: 'npx vac-ui-components add file-upload',
  },
];

export const ComponentsCatalogPage: React.FC = () => {
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [activeSort, setActiveSort] = useState<'Trending' | 'Best' | 'Recent'>('Trending');
  const [priceFilter, setPriceFilter] = useState<'All' | 'Free' | 'Pro'>('All');
  const [styleFilter, setStyleFilter] = useState<'All' | 'Minimal' | 'Dark' | 'Glass' | 'Editorial'>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyCli = (command: string, id: string) => {
    navigator.clipboard.writeText(command);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredComponents = TEMPLATE_COMPONENTS.filter((comp) => {
    if (selectedSubcategory && comp.subcategory !== selectedSubcategory) {
      return false;
    }
    if (priceFilter !== 'All' && comp.price !== priceFilter) {
      return false;
    }
    if (styleFilter !== 'All' && comp.style !== styleFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0D0E12] text-[#E4E4E7] px-6 sm:px-10 lg:px-14 py-10 selection:bg-purple-500/30">
      <div className="max-w-[1560px] mx-auto space-y-10">
        
        {/* ============================================================== */}
        {/* HEADER SECTION (Matching exact image layout & typography)     */}
        {/* ============================================================== */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-white">
            Templates
          </h1>
          <p className="text-sm text-[#8E8F99] max-w-xl leading-relaxed font-normal">
            Browse polished templates from the community to find the perfect starting point for your next website.
          </p>
        </div>

        {/* ============================================================== */}
        {/* CATEGORY DIRECTORY (10 Columns matching the reference image)   */}
        {/* ============================================================== */}
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-x-6 gap-y-7 pt-2 pb-6 border-b border-white/[0.07]">
          {CATEGORY_COLUMNS.map((col) => (
            <div key={col.name} className="space-y-3">
              <h3 className="text-xs font-semibold text-white tracking-tight">
                {col.name}
              </h3>
              <ul className="space-y-2 text-xs">
                {col.items.map((item) => {
                  const isSelected = selectedSubcategory === item;
                  return (
                    <li key={item}>
                      <button
                        onClick={() =>
                          setSelectedSubcategory(isSelected ? null : item)
                        }
                        className={`text-left transition-colors duration-150 ${
                          isSelected
                            ? 'text-white font-medium underline underline-offset-4 decoration-purple-500'
                            : 'text-[#8E8F99] hover:text-white'
                        }`}
                      >
                        {item}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* ============================================================== */}
        {/* FILTER BAR: Trending / Best / Recent + Price / Style dropdowns */}
        {/* ============================================================== */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          {/* Left sort pills */}
          <div className="inline-flex items-center gap-1 p-1 rounded-full bg-white/[0.04] border border-white/[0.06]">
            {(['Trending', 'Best', 'Recent'] as const).map((tab) => {
              const isActive = activeSort === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveSort(tab)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-white/[0.12] text-white shadow-xs'
                      : 'text-[#8E8F99] hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Right dropdown filters */}
          <div className="flex items-center gap-2.5">
            {selectedSubcategory && (
              <button
                onClick={() => setSelectedSubcategory(null)}
                className="text-xs text-purple-400 hover:text-purple-300 font-medium mr-2"
              >
                Clear subcategory ({selectedSubcategory}) ✕
              </button>
            )}

            {/* Price Dropdown */}
            <div className="relative">
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value as any)}
                className="appearance-none bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] text-white text-xs rounded-full pl-4 pr-8 py-1.5 focus:outline-none focus:border-purple-500 cursor-pointer font-medium"
              >
                <option value="All" className="bg-[#181A20] text-white">Price: All</option>
                <option value="Free" className="bg-[#181A20] text-white">Free</option>
                <option value="Pro" className="bg-[#181A20] text-white">Pro</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Style Dropdown */}
            <div className="relative">
              <select
                value={styleFilter}
                onChange={(e) => setStyleFilter(e.target.value as any)}
                className="appearance-none bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] text-white text-xs rounded-full pl-4 pr-8 py-1.5 focus:outline-none focus:border-purple-500 cursor-pointer font-medium"
              >
                <option value="All" className="bg-[#181A20] text-white">Style: All</option>
                <option value="Dark" className="bg-[#181A20] text-white">Dark</option>
                <option value="Minimal" className="bg-[#181A20] text-white">Minimal</option>
                <option value="Glass" className="bg-[#181A20] text-white">Glass</option>
                <option value="Editorial" className="bg-[#181A20] text-white">Editorial</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* TEMPLATES / COMPONENTS PREVIEW GRID                            */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          {filteredComponents.map((item) => (
            <div
              key={item.id}
              className="group rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.2] transition-all overflow-hidden flex flex-col justify-between"
            >
              {/* Preview Thumbnail Container */}
              <div className="relative aspect-[16/10] bg-black/40 overflow-hidden border-b border-white/[0.05]">
                {/* Visual preview representation */}
                <div className="absolute inset-0 p-4 flex flex-col justify-between bg-gradient-to-br from-white/[0.03] to-white/[0.01]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300 bg-purple-500/20 border border-purple-500/30 px-2.5 py-0.5 rounded-full">
                      {item.subcategory}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">
                      {item.style}
                    </span>
                  </div>

                  {/* Mock Wireframe Preview Layout */}
                  <div className="w-full h-24 rounded-xl bg-white/[0.05] border border-white/10 p-3 flex flex-col justify-between group-hover:scale-[1.02] transition-transform">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
                      <div className="h-2 w-16 bg-white/10 rounded-full ml-auto" />
                    </div>
                    <div className="space-y-1.5 py-1">
                      <div className="h-3 w-3/4 bg-white/20 rounded-md" />
                      <div className="h-2 w-1/2 bg-white/10 rounded-md" />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div className="h-3 w-12 bg-purple-500/40 rounded-full" />
                      <div className="h-2.5 w-8 bg-white/10 rounded-full" />
                    </div>
                  </div>

                  {/* Hover Quick Actions */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center gap-2 p-4">
                    <button
                      onClick={() => copyCli(item.cliCommand, item.id)}
                      className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20 flex items-center gap-1.5 transition-all"
                    >
                      {copiedId === item.id ? (
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
                    <a
                      href={`/components/${item.slug}`}
                      className="px-3 py-1.5 rounded-full bg-white text-black hover:bg-gray-100 text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      <span>Preview</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Card Meta Footer */}
              <div className="p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                    {item.title}
                  </h4>
                  <span className="text-xs font-medium text-emerald-400">
                    {item.price}
                  </span>
                </div>
                <p className="text-xs text-[#8E8F99] line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px] text-gray-500 font-mono">
                  <span>{item.downloads} downloads</span>
                  <span className="text-purple-400 hover:underline">vac-ui add</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
