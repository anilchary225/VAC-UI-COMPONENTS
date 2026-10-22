import React, { useState, useEffect } from 'react';
import {
  X,
  Bookmark,
  FolderPlus,
  Check,
  Terminal,
  Copy,
  Clock,
  History,
  GitCompare,
  Code,
  Eye,
  AlertTriangle,
  FileCode,
  FilePlus,
  FileMinus,
  FileDiff,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Layers,
} from 'lucide-react';
import { api } from '../lib/api';
import { ComponentLivePreview } from './previews/ComponentLivePreview';

interface ComponentInspectorModalProps {
  component: {
    slug: string;
    title: string;
    description: string;
    category: string;
    subcategory: string;
    cliCommand: string;
    props: Array<{ name: string; type: string; default?: string; description: string }>;
    codeSnippet: string;
  };
  onClose: () => void;
  isFavorite: (slug: string) => boolean;
  toggleFavorite: (slug: string) => void;
  collections: any[];
  addComponentToCollection: (collectionId: string, slug: string) => Promise<any>;
}

export const ComponentInspectorModal: React.FC<ComponentInspectorModalProps> = ({
  component,
  onClose,
  isFavorite,
  toggleFavorite,
  collections,
  addComponentToCollection,
}) => {
  // Navigation tabs inside inspector
  const [activeTab, setActiveTab] = useState<'preview' | 'history' | 'compare'>('preview');

  // Version management state
  const [availableVersions, setAvailableVersions] = useState<string[]>([]);
  const [versionDetails, setVersionDetails] = useState<Array<{
    version: string;
    publishedAt: string;
    changelog?: string;
    deprecated?: boolean;
    deprecationReason?: string;
  }>>([]);
  const [latestVersion, setLatestVersion] = useState<string>('1.0.0');
  const [selectedVersion, setSelectedVersion] = useState<string>('1.0.0');
  const [activeManifest, setActiveManifest] = useState<any | null>(null);
  const [isLoadingManifest, setIsLoadingManifest] = useState(false);

  // Compare mode state
  const [fromVersion, setFromVersion] = useState<string>('1.0.0');
  const [toVersion, setToVersion] = useState<string>('1.0.0');
  const [comparisonData, setComparisonData] = useState<any | null>(null);
  const [isLoadingComparison, setIsLoadingComparison] = useState(false);
  const [compareSubView, setCompareSubView] = useState<'files' | 'dependencies' | 'props' | 'notes'>('files');
  const [selectedDiffFile, setSelectedDiffFile] = useState<string | null>(null);

  // Raw manifest JSON modal
  const [showRawManifest, setShowRawManifest] = useState(false);

  // Collection feedback
  const [collectionMenuOpen, setCollectionMenuOpen] = useState(false);
  const [collectionFeedback, setCollectionFeedback] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // 1. Load published versions list on component mount
  useEffect(() => {
    let isMounted = true;
    api
      .getRegistryVersions(component.slug)
      .then((data) => {
        if (!isMounted) return;
        if (data.versions && data.versions.length > 0) {
          setAvailableVersions(data.versions);
          setLatestVersion(data.latest || data.versions[0]);
          setSelectedVersion(data.latest || data.versions[0]);
          setToVersion(data.latest || data.versions[0]);
          if (data.versions.length > 1) {
            setFromVersion(data.versions[data.versions.length - 1]);
          } else {
            setFromVersion(data.versions[0]);
          }
        }
        if (data.details) {
          setVersionDetails(data.details);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch registry versions:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [component.slug]);

  // 2. Load manifest for currently selected version
  useEffect(() => {
    if (!selectedVersion) return;
    let isMounted = true;
    setIsLoadingManifest(true);
    api
      .getRegistryManifest(component.slug, selectedVersion)
      .then((manifest) => {
        if (isMounted) {
          setActiveManifest(manifest);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch release manifest:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingManifest(false);
      });

    return () => {
      isMounted = false;
    };
  }, [component.slug, selectedVersion]);

  // 3. Load comparison when compare tab is selected or versions change
  useEffect(() => {
    if (activeTab !== 'compare' || !fromVersion || !toVersion) return;
    let isMounted = true;
    setIsLoadingComparison(true);
    api
      .compareRegistryVersions(component.slug, fromVersion, toVersion)
      .then((data) => {
        if (isMounted) {
          setComparisonData(data);
          if (data.files && data.files.length > 0) {
            setSelectedDiffFile(data.files[0].path);
          }
        }
      })
      .catch((err) => {
        console.warn('Failed to load version comparison:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingComparison(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeTab, component.slug, fromVersion, toVersion]);

  // Computed CLI command for selected version
  const exactCliCommand =
    selectedVersion === latestVersion
      ? `npx vac-ui-components add ${component.slug}`
      : `npx vac-ui-components add ${component.slug} --version ${selectedVersion}`;

  // Check if selected version is deprecated
  const isSelectedDeprecated =
    activeManifest?.deprecated ||
    versionDetails.find((v) => v.version === selectedVersion)?.deprecated;
  const deprecationReason =
    activeManifest?.deprecationReason ||
    versionDetails.find((v) => v.version === selectedVersion)?.deprecationReason;

  // Active props to display
  const activeProps =
    activeManifest?.props && activeManifest.props.length > 0
      ? activeManifest.props
      : component.props;

  // Active code snippet
  const activeCodeSnippet =
    activeManifest?.files && activeManifest.files.length > 0
      ? activeManifest.files.find((f: any) => f.isEntry)?.content || activeManifest.files[0].content
      : component.codeSnippet;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl bg-white dark:bg-[#11131A] rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-2xl border border-[#E8EAEF] dark:border-white/10 space-y-5 max-h-[92vh] overflow-y-auto"
      >
        {/* ============================================================== */}
        {/* MODAL HEADER & ACTIONS                                         */}
        {/* ============================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-4 border-b border-[#E8EAEF] dark:border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#5B4FF5] bg-[#5B4FF5]/10 px-2.5 py-0.5 rounded-full font-medium">
                {component.category} · {component.subcategory}
              </span>

              {/* Version Selector Chip */}
              <div className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-white/[0.05] border border-gray-200 dark:border-white/10 px-2.5 py-0.5 rounded-full text-xs font-mono">
                <span className="text-gray-500 dark:text-gray-400">v{selectedVersion}</span>
                {selectedVersion === latestVersion && (
                  <span className="text-[9px] font-sans font-semibold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.2 rounded-full">
                    latest
                  </span>
                )}
                {isSelectedDeprecated && (
                  <span className="text-[9px] font-sans font-semibold text-amber-500 bg-amber-500/10 px-1.5 py-0.2 rounded-full">
                    deprecated
                  </span>
                )}
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-[#161722] dark:text-white">
              {component.title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xl">
              {component.description}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 relative">
            {/* Version Switcher Dropdown */}
            {availableVersions.length > 1 && (
              <div className="relative">
                <select
                  value={selectedVersion}
                  onChange={(e) => setSelectedVersion(e.target.value)}
                  className="appearance-none pl-3 pr-7 py-1.5 rounded-full text-xs font-mono bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 border border-[#E8EAEF] dark:border-white/10 text-gray-800 dark:text-white focus:outline-none transition-colors cursor-pointer"
                >
                  {availableVersions.map((v) => (
                    <option key={v} value={v}>
                      v{v} {v === latestVersion ? '(latest)' : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}

            {/* Favorite Bookmark */}
            <button
              onClick={() => toggleFavorite(component.slug)}
              className={`p-2 rounded-full border transition-all ${
                isFavorite(component.slug)
                  ? 'bg-purple-500/10 border-purple-500/30 text-[#5B4FF5]'
                  : 'border-[#E8EAEF] dark:border-white/10 text-gray-400 hover:text-[#5B4FF5]'
              }`}
              title={isFavorite(component.slug) ? 'Remove favorite' : 'Add to favorites'}
            >
              <Bookmark
                className={`w-4 h-4 ${isFavorite(component.slug) ? 'fill-[#5B4FF5]' : ''}`}
              />
            </button>

            {/* Add to Collection */}
            <div className="relative">
              <button
                onClick={() => setCollectionMenuOpen(!collectionMenuOpen)}
                className="p-2 rounded-full border border-[#E8EAEF] dark:border-white/10 text-gray-400 hover:text-[#5B4FF5] transition-all"
                title="Add to collection"
              >
                <FolderPlus className="w-4 h-4" />
              </button>

              {collectionMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#161722] border border-[#E8EAEF] dark:border-white/15 p-2 shadow-2xl z-50 text-xs">
                  <p className="px-2 py-1 font-semibold text-gray-500 text-[10px] uppercase">
                    Save to Collection
                  </p>
                  {collections.length === 0 ? (
                    <p className="px-2 py-2 text-gray-400 text-[11px]">
                      No collections found. Create one in Collections page.
                    </p>
                  ) : (
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {collections.map((col) => {
                        const inCol = col.items.some((it: any) => it.componentSlug === component.slug);
                        return (
                          <button
                            key={col.id}
                            onClick={async () => {
                              try {
                                await addComponentToCollection(col.id, component.slug);
                                setCollectionFeedback(`Added to "${col.name}"`);
                                setTimeout(() => setCollectionFeedback(null), 2500);
                              } catch (err: any) {
                                setCollectionFeedback(err.message || 'Error adding');
                              }
                              setCollectionMenuOpen(false);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-between transition-colors"
                          >
                            <span className="truncate">{col.name}</span>
                            {inCol && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Collection Feedback Alert */}
        {collectionFeedback && (
          <div className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[#5B4FF5] text-xs font-medium flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            <span>{collectionFeedback}</span>
          </div>
        )}

        {/* Deprecation Warning Banner if selected version is deprecated */}
        {isSelectedDeprecated && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">
                Version {selectedVersion} is deprecated
              </p>
              <p className="text-amber-300/80 text-[11px] mt-0.5">
                {deprecationReason ||
                  `This release has been superceded. We recommend installing latest version v${latestVersion}.`}
              </p>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* NAVIGATION TABS                                                */}
        {/* ============================================================== */}
        <div className="flex items-center gap-2 border-b border-[#E8EAEF] dark:border-white/10 pb-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'preview'
                ? 'bg-[#5B4FF5] text-white shadow-md'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Overview & Preview</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'history'
                ? 'bg-[#5B4FF5] text-white shadow-md'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Version History</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-mono">
              {availableVersions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('compare')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'compare'
                ? 'bg-[#5B4FF5] text-white shadow-md'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Compare Versions</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: OVERVIEW & LIVE PREVIEW                                 */}
        {/* ============================================================== */}
        {activeTab === 'preview' && (
          <div className="space-y-6">
            {/* Live Interactive Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-[#161722] dark:text-white uppercase tracking-wider">
                  Live Interactive Preview
                </h4>
                <span className="text-[11px] text-gray-500 font-mono">
                  Inspecting v{selectedVersion}
                </span>
              </div>
              <ComponentLivePreview slug={component.slug} />
            </div>

            {/* Quick Install Command Box */}
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-black/40 border border-gray-200/80 dark:border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 font-mono text-xs">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 overflow-x-auto">
                <Terminal className="w-4 h-4 text-[#5B4FF5] shrink-0" />
                <span className="truncate">{exactCliCommand}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => copyToClipboard(exactCliCommand, 'cli')}
                  className="px-3 py-1 rounded-full bg-[#181A25] hover:bg-black text-white text-[11px] font-sans font-medium flex items-center gap-1 transition-all"
                >
                  {copiedKey === 'cli' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Command</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowRawManifest(!showRawManifest)}
                  className="px-3 py-1 rounded-full border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:text-white hover:bg-white/5 text-[11px] font-sans font-medium transition-all"
                >
                  {showRawManifest ? 'Hide Manifest' : 'View Manifest'}
                </button>
              </div>
            </div>

            {/* Raw Manifest Viewer Expandable */}
            {showRawManifest && activeManifest && (
              <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-400">
                    Release Manifest (v{activeManifest.version})
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(JSON.stringify(activeManifest, null, 2), 'manifest')
                    }
                    className="text-xs text-[#5B4FF5] hover:underline flex items-center gap-1 font-mono"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedKey === 'manifest' ? 'Copied!' : 'Copy JSON'}</span>
                  </button>
                </div>
                <pre className="text-xs font-mono text-gray-300 max-h-60 overflow-y-auto">
                  <code>{JSON.stringify(activeManifest, null, 2)}</code>
                </pre>
              </div>
            )}

            {/* Supported Props Table */}
            <div>
              <h4 className="text-xs font-semibold text-[#161722] dark:text-white uppercase tracking-wider mb-2">
                Supported Props (v{selectedVersion})
              </h4>
              <div className="rounded-2xl border border-[#E8EAEF] dark:border-white/10 overflow-x-auto text-xs">
                <table className="w-full min-w-[500px] text-left">
                  <thead className="bg-gray-50 dark:bg-white/[0.03] text-gray-500 border-b border-[#E8EAEF] dark:border-white/10">
                    <tr>
                      <th className="p-2.5 font-medium">Prop</th>
                      <th className="p-2.5 font-medium">Type</th>
                      <th className="p-2.5 font-medium">Default</th>
                      <th className="p-2.5 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8EAEF] dark:divide-white/[0.05]">
                    {activeProps.map((p: any) => (
                      <tr key={p.name}>
                        <td className="p-2.5 font-mono text-[#5B4FF5] font-semibold">{p.name}</td>
                        <td className="p-2.5 font-mono text-gray-500">{p.type}</td>
                        <td className="p-2.5 font-mono text-gray-400">{p.defaultValue || p.default || '-'}</td>
                        <td className="p-2.5 text-gray-600 dark:text-gray-300">{p.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Source Code Snippet */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-[#161722] dark:text-white uppercase tracking-wider">
                  Source Code (v{selectedVersion})
                </h4>
                <button
                  onClick={() => copyToClipboard(activeCodeSnippet, 'code')}
                  className="text-xs text-[#5B4FF5] hover:underline flex items-center gap-1 font-medium"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedKey === 'code' ? 'Copied!' : 'Copy Snippet'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-2xl bg-gray-900 text-gray-200 text-xs font-mono overflow-x-auto border border-gray-800 max-h-72">
                <code>{activeCodeSnippet}</code>
              </pre>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: VERSION HISTORY LIST                                    */}
        {/* ============================================================== */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-[#161722] dark:text-white">
                  Published Releases
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Chronological archive of immutable production releases for {component.title}.
                </p>
              </div>
              <span className="text-xs text-gray-400 font-mono">
                {availableVersions.length} versions published
              </span>
            </div>

            <div className="divide-y divide-[#E8EAEF] dark:divide-white/5 border-t border-[#E8EAEF] dark:border-white/10">
              {versionDetails.length > 0 ? (
                versionDetails.map((ver) => {
                  const isCurrent = ver.version === selectedVersion;
                  const isLatest = ver.version === latestVersion;
                  return (
                    <div key={ver.version} className="py-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-sm font-bold text-[#5B4FF5]">
                            v{ver.version}
                          </span>
                          {isLatest && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                              Latest Release
                            </span>
                          )}
                          {isCurrent && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-[#5B4FF5] border border-purple-500/20 font-medium">
                              Currently Viewing
                            </span>
                          )}
                          {ver.deprecated && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                              Deprecated
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-400">
                            {ver.publishedAt
                              ? new Date(ver.publishedAt).toLocaleDateString()
                              : 'Active'}
                          </span>
                          {!isCurrent && (
                            <button
                              onClick={() => {
                                setSelectedVersion(ver.version);
                                setActiveTab('preview');
                              }}
                              className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 text-gray-800 dark:text-white transition-colors"
                            >
                              Inspect
                            </button>
                          )}
                          <button
                            onClick={() => {
                              const cmd = `npx vac-ui-components add ${component.slug} --version ${ver.version}`;
                              copyToClipboard(cmd, ver.version);
                            }}
                            className="px-2.5 py-1 rounded-full text-[11px] font-medium border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1"
                            title="Copy install command for this version"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedKey === ver.version ? 'Copied!' : 'Copy CLI'}</span>
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        {ver.changelog || 'Official catalog release.'}
                      </p>

                      {ver.deprecated && (
                        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                          <span>Notice: {ver.deprecationReason || 'Marked as deprecated by catalog admin.'}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-gray-400">
                  <Clock className="w-8 h-8 mx-auto text-gray-500 mb-2 opacity-60" />
                  <p>Loading published version history...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: COMPARE VERSIONS                                        */}
        {/* ============================================================== */}
        {activeTab === 'compare' && (
          <div className="space-y-5">
            {/* Version Pickers Header */}
            <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-white/[0.02] border border-[#E8EAEF] dark:border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 text-[#5B4FF5] border border-purple-500/20">
                  <GitCompare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#161722] dark:text-white">
                    Version Comparison
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Inspect line-level source code diffs, dependencies, and prop alterations.
                  </p>
                </div>
              </div>

              {/* Selectors */}
              <div className="flex items-center gap-2 font-mono text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400 font-sans text-[11px]">From:</span>
                  <select
                    value={fromVersion}
                    onChange={(e) => setFromVersion(e.target.value)}
                    className="p-1.5 rounded-xl bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 text-white focus:outline-none"
                  >
                    {availableVersions.map((v) => (
                      <option key={v} value={v}>
                        v{v}
                      </option>
                    ))}
                  </select>
                </div>

                <span className="text-gray-400 font-sans">→</span>

                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400 font-sans text-[11px]">To:</span>
                  <select
                    value={toVersion}
                    onChange={(e) => setToVersion(e.target.value)}
                    className="p-1.5 rounded-xl bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 text-white focus:outline-none"
                  >
                    {availableVersions.map((v) => (
                      <option key={v} value={v}>
                        v{v} {v === latestVersion ? '(latest)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Comparison Metrics Summary Bar */}
            {comparisonData && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-between">
                  <span className="text-gray-400 text-[11px]">Added Files</span>
                  <span className="font-mono font-bold text-sm">+{comparisonData.summary?.filesAdded || 0}</span>
                </div>
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-between">
                  <span className="text-gray-400 text-[11px]">Removed</span>
                  <span className="font-mono font-bold text-sm">-{comparisonData.summary?.filesRemoved || 0}</span>
                </div>
                <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-[#5B4FF5] flex items-center justify-between">
                  <span className="text-gray-400 text-[11px]">Modified</span>
                  <span className="font-mono font-bold text-sm">~{comparisonData.summary?.filesModified || 0}</span>
                </div>
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-between">
                  <span className="text-gray-400 text-[11px]">Dependencies</span>
                  <span className="font-mono font-bold text-sm">{comparisonData.summary?.dependenciesChanged || 0}</span>
                </div>
                <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-between">
                  <span className="text-gray-400 text-[11px]">Props Changed</span>
                  <span className="font-mono font-bold text-sm">{comparisonData.summary?.propsChanged || 0}</span>
                </div>
              </div>
            )}

            {/* Sub-view navigation for compare */}
            <div className="flex items-center gap-2 border-b border-[#E8EAEF] dark:border-white/10 pb-2 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setCompareSubView('files')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors shrink-0 whitespace-nowrap ${
                  compareSubView === 'files'
                    ? 'bg-purple-500/15 text-[#5B4FF5] font-semibold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                File Differences
              </button>
              <button
                onClick={() => setCompareSubView('dependencies')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors shrink-0 whitespace-nowrap ${
                  compareSubView === 'dependencies'
                    ? 'bg-purple-500/15 text-[#5B4FF5] font-semibold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Dependencies & Styling
              </button>
              <button
                onClick={() => setCompareSubView('props')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors shrink-0 whitespace-nowrap ${
                  compareSubView === 'props'
                    ? 'bg-purple-500/15 text-[#5B4FF5] font-semibold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Props
              </button>
              <button
                onClick={() => setCompareSubView('notes')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors shrink-0 whitespace-nowrap ${
                  compareSubView === 'notes'
                    ? 'bg-purple-500/15 text-[#5B4FF5] font-semibold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Changelog & Notes
              </button>
            </div>

            {/* SUBVIEW 1: FILES & LINE DIFFS */}
            {compareSubView === 'files' && (
              <div className="space-y-4">
                {isLoadingComparison ? (
                  <div className="p-12 text-center text-xs text-gray-400">
                    Computing line-level differences between v{fromVersion} and v{toVersion}...
                  </div>
                ) : comparisonData?.files && comparisonData.files.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* File list column */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                        Files in Release
                      </span>
                      {comparisonData.files.map((f: any) => (
                        <button
                          key={f.path}
                          onClick={() => setSelectedDiffFile(f.path)}
                          className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                            selectedDiffFile === f.path
                              ? 'bg-purple-500/20 border border-purple-500/30 text-white'
                              : 'bg-gray-50 dark:bg-white/[0.02] border border-[#E8EAEF] dark:border-white/5 text-gray-400 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileCode className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="truncate font-mono">{f.name}</span>
                          </div>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded-md font-semibold uppercase ${
                              f.status === 'added'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : f.status === 'removed'
                                ? 'bg-rose-500/20 text-rose-400'
                                : f.status === 'modified'
                                ? 'bg-purple-500/20 text-[#5B4FF5]'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}
                          >
                            {f.status}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Diff content view column */}
                    <div className="md:col-span-2 space-y-2">
                      {selectedDiffFile && (() => {
                        const targetFile = comparisonData.files.find((f: any) => f.path === selectedDiffFile);
                        if (!targetFile) return null;
                        return (
                          <div className="rounded-2xl border border-[#E8EAEF] dark:border-white/10 overflow-hidden bg-gray-950">
                            <div className="px-4 py-2.5 bg-gray-900 border-b border-gray-800 flex items-center justify-between text-xs font-mono">
                              <span className="text-gray-300">{targetFile.path}</span>
                              <span className="text-gray-500">{targetFile.status}</span>
                            </div>

                            {/* Line-level diff viewer */}
                            <div className="p-3 font-mono text-xs overflow-x-auto max-h-80 divide-y divide-gray-900">
                              {targetFile.lineDiff && targetFile.lineDiff.length > 0 ? (
                                targetFile.lineDiff.map((l: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className={`flex items-start gap-3 px-2 py-0.5 ${
                                      l.type === 'add'
                                        ? 'bg-emerald-500/15 text-emerald-300'
                                        : l.type === 'del'
                                        ? 'bg-rose-500/15 text-rose-300'
                                        : 'text-gray-400'
                                    }`}
                                  >
                                    <span className="w-5 text-gray-600 select-none text-right shrink-0">
                                      {l.type === 'add' ? '+' : l.type === 'del' ? '-' : ' '}
                                    </span>
                                    <span className="w-6 text-gray-700 select-none text-right shrink-0">
                                      {idx + 1}
                                    </span>
                                    <span className="whitespace-pre">{l.line}</span>
                                  </div>
                                ))
                              ) : (
                                <p className="p-4 text-center text-gray-500">
                                  No line-level changes in this file between v{fromVersion} and v{toVersion}.
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                ) : (
                  <p className="p-8 text-center text-xs text-gray-400">
                    No files found for comparison.
                  </p>
                )}
              </div>
            )}

            {/* SUBVIEW 2: DEPENDENCIES & STYLING */}
            {compareSubView === 'dependencies' && comparisonData && (
              <div className="space-y-4 text-xs">
                {/* Declared dependencies diff */}
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-[#E8EAEF] dark:border-white/10 space-y-3">
                  <h5 className="font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider text-[11px]">
                    Package Dependencies
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
                    {/* Added */}
                    <div>
                      <span className="text-emerald-400 font-sans text-[11px] block mb-1">Added:</span>
                      {Object.keys(comparisonData.dependencies?.added || {}).length === 0 ? (
                        <span className="text-gray-500 text-[11px]">None</span>
                      ) : (
                        Object.entries(comparisonData.dependencies.added).map(([k, v]) => (
                          <div key={k} className="text-emerald-300 text-[11px]">
                            + {k}: {String(v)}
                          </div>
                        ))
                      )}
                    </div>

                    {/* Removed */}
                    <div>
                      <span className="text-rose-400 font-sans text-[11px] block mb-1">Removed:</span>
                      {Object.keys(comparisonData.dependencies?.removed || {}).length === 0 ? (
                        <span className="text-gray-500 text-[11px]">None</span>
                      ) : (
                        Object.entries(comparisonData.dependencies.removed).map(([k, v]) => (
                          <div key={k} className="text-rose-300 text-[11px]">
                            - {k}: {String(v)}
                          </div>
                        ))
                      )}
                    </div>

                    {/* Modified */}
                    <div>
                      <span className="text-purple-400 font-sans text-[11px] block mb-1">Modified:</span>
                      {Object.keys(comparisonData.dependencies?.modified || {}).length === 0 ? (
                        <span className="text-gray-500 text-[11px]">None</span>
                      ) : (
                        Object.entries(comparisonData.dependencies.modified).map(([k, v]: any) => (
                          <div key={k} className="text-purple-300 text-[11px]">
                            ~ {k}: {v.from} → {v.to}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Styling Diff */}
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-[#E8EAEF] dark:border-white/10 space-y-2">
                  <h5 className="font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider text-[11px]">
                    Styling Requirements
                  </h5>
                  <div className="text-xs text-gray-400 space-y-1">
                    <p>
                      Framework:{' '}
                      <span className="text-white font-mono">
                        {comparisonData.styling?.framework?.from} →{' '}
                        {comparisonData.styling?.framework?.to}
                      </span>{' '}
                      {comparisonData.styling?.framework?.changed ? '(Changed)' : '(Unchanged)'}
                    </p>
                    <p>
                      CSS Requirements:{' '}
                      <span className="text-white">
                        {comparisonData.styling?.requiredCssChanged
                          ? 'Modified between versions'
                          : 'Identical across versions'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SUBVIEW 3: PROPS DIFF */}
            {compareSubView === 'props' && comparisonData && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-[#E8EAEF] dark:border-white/10 space-y-3">
                  <h5 className="font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider text-[11px]">
                    Component Props Differences
                  </h5>

                  {comparisonData.props?.added?.length === 0 &&
                  comparisonData.props?.removed?.length === 0 &&
                  comparisonData.props?.modified?.length === 0 ? (
                    <p className="text-gray-500 text-xs py-2">
                      Props signatures are identical between v{fromVersion} and v{toVersion}.
                    </p>
                  ) : (
                    <div className="space-y-2 font-mono">
                      {comparisonData.props.added.map((p: any) => (
                        <div key={p.name} className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                          + Prop added: <strong>{p.name}</strong> ({p.type})
                        </div>
                      ))}
                      {comparisonData.props.removed.map((p: any) => (
                        <div key={p.name} className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                          - Prop removed: <strong>{p.name}</strong>
                        </div>
                      ))}
                      {comparisonData.props.modified.map((p: any) => (
                        <div key={p.name} className="p-2 rounded-xl bg-purple-500/10 text-purple-300">
                          ~ Prop modified: <strong>{p.name}</strong> (type changed from {p.from.type} to {p.to.type})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUBVIEW 4: CHANGELOG & NOTES */}
            {compareSubView === 'notes' && comparisonData && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-[#E8EAEF] dark:border-white/10 space-y-2">
                  <h5 className="font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider text-[11px]">
                    Release Notes (v{toVersion})
                  </h5>
                  <p className="text-gray-300 leading-relaxed">
                    {comparisonData.changelog || 'No release notes provided.'}
                  </p>
                </div>

                {comparisonData.toDeprecated && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>Target Version (v{toVersion}) is Deprecated</span>
                    </div>
                    <p className="text-[11px] text-amber-300/80">
                      Reason: {comparisonData.toDeprecationReason || 'Marked as deprecated by catalog admin.'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
