import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Save,
  CheckCircle,
  AlertTriangle,
  Send,
  FileCode,
  Layers,
  Settings,
  Eye,
  History,
  Plus,
  Trash2,
  Terminal,
  Shield,
  Tag,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { ComponentFile, ComponentProp } from '@vac/shared';
import { api } from '../../lib/api';
import { StudioDraftPreview } from './StudioDraftPreview';

export const CATEGORY_OPTIONS = [
  'Auth & Form Fields',
  'Navigation Shells',
  'Tactile Micro-UX',
  'Telemetry & Charts',
  'Feedback & Loaders',
  'Action Triggers',
  'Surface Cards',
];

interface ComponentStudioProps {
  componentId: string | null; // null means create new
  onClose: () => void;
  onPublished?: (slug: string) => void;
}

export const ComponentStudio: React.FC<ComponentStudioProps> = ({
  componentId,
  onClose,
  onPublished,
}) => {
  const isNew = !componentId;

  // Active studio tab
  const [activeTab, setActiveTab] = useState<'metadata' | 'files' | 'dependencies' | 'preview' | 'validation' | 'history'>('metadata');

  // Metadata state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [tags, setTags] = useState<string[]>(['React', 'Tailwind']);
  const [newTagInput, setNewTagInput] = useState('');
  const [documentation, setDocumentation] = useState('');
  const [license, setLicense] = useState('MIT');
  const [author, setAuthor] = useState('VAC Team');
  const [status, setStatus] = useState<string>('draft');
  const [currentVersion, setCurrentVersion] = useState('1.0.0');

  // Source files state
  const [files, setFiles] = useState<ComponentFile[]>([
    {
      path: 'src/components/Component.tsx',
      name: 'Component.tsx',
      content: `import React from 'react';\n\nexport const MyComponent: React.FC = () => {\n  return (\n    <div className="p-6 rounded-2xl bg-white dark:bg-[#11131A] border border-white/10 shadow-lg">\n      <h3 className="text-lg font-bold text-white">Interactive Component</h3>\n      <p className="text-xs text-gray-400 mt-1">Ready for custom developer implementation.</p>\n    </div>\n  );\n};\n\nexport default MyComponent;\n`,
      language: 'typescript',
      isEntry: true,
    },
  ]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [newFilePath, setNewFilePath] = useState('');
  const [showAddFileModal, setShowAddFileModal] = useState(false);

  // Dependencies & Props
  const [dependencies, setDependencies] = useState<Record<string, string>>({
    react: '>=18.0.0',
    'react-dom': '>=18.0.0',
    'motion/react': '^12.0.0',
    'lucide-react': '^1.0.0',
  });
  const [newDepKey, setNewDepKey] = useState('');
  const [newDepVal, setNewDepVal] = useState('^1.0.0');

  const [propsList, setPropsList] = useState<ComponentProp[]>([
    { name: 'title', type: 'string', required: false, defaultValue: '"Welcome"', description: 'Primary heading label' },
  ]);
  const [newPropName, setNewPropName] = useState('');
  const [newPropType, setNewPropType] = useState('string');

  // Validation report state
  const [validationReport, setValidationReport] = useState<{
    valid: boolean;
    errors: string[];
    checkedAt?: string;
  } | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Publishing form
  const [publishVersion, setPublishVersion] = useState('1.0.0');
  const [publishChangelog, setPublishChangelog] = useState('Initial production release from Component Studio.');
  const [isPublishing, setIsPublishing] = useState(false);

  // Versions history
  const [versionsList, setVersionsList] = useState<any[]>([]);

  // Studio UI state
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Load existing component if editing
  useEffect(() => {
    if (componentId) {
      api.getAdminComponent(componentId).then((comp) => {
        setName(comp.name);
        setSlug(comp.slug);
        setDescription(comp.description || '');
        setCategory(comp.category || CATEGORY_OPTIONS[0]);
        setTags(comp.tags || []);
        setDocumentation(comp.documentation || '');
        setLicense(comp.license || 'MIT');
        setAuthor(comp.author || 'VAC Team');
        setStatus(comp.status);
        setCurrentVersion(comp.currentVersion || '1.0.0');
        setPublishVersion(comp.currentVersion || '1.0.0');

        if (comp.draftFiles && comp.draftFiles.length > 0) {
          setFiles(comp.draftFiles);
        }
        if (comp.draftDependencies) {
          setDependencies(comp.draftDependencies);
        }
        if (comp.draftProps) {
          setPropsList(comp.draftProps);
        }
        if (comp.lastValidationResult) {
          setValidationReport(comp.lastValidationResult);
        }
        if (comp.versions) {
          setVersionsList(comp.versions);
        }
      }).catch((err) => {
        console.error('Failed to load component details:', err);
      });
    }
  }, [componentId]);

  // Auto-slugify when typing name in new component mode
  const handleNameChange = (val: string) => {
    setName(val);
    setIsDirty(true);
    if (isNew && !slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      );
    }
  };

  // Keyboard shortcut Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSaveDraft();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [name, slug, description, category, tags, documentation, files, dependencies, propsList]);

  // Save Draft
  const handleSaveDraft = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      if (isNew) {
        const created = await api.createAdminComponent({
          name,
          slug,
          description,
          category,
          tags,
          documentation,
          license,
          author,
        });
        setStatusMessage({ text: 'Draft component created successfully.', type: 'success' });
        setIsDirty(false);
        // Switch to editing created component
        if (created.slug) {
          setSlug(created.slug);
        }
      } else {
        await api.updateAdminComponent(componentId || slug, {
          name,
          description,
          category,
          tags,
          documentation,
          license,
          author,
          draftFiles: files,
          draftDependencies: dependencies,
          draftProps: propsList,
        });
        setStatusMessage({ text: 'Draft saved successfully.', type: 'success' });
        setIsDirty(false);
      }
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Failed to save draft.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Run Server Validation
  const handleRunValidation = async () => {
    setIsValidating(true);
    try {
      // First save draft
      await handleSaveDraft();
      const res = await api.validateAdminComponent(slug);
      setValidationReport(res.report);
      if (res.report.valid) {
        setStatusMessage({ text: 'Validation succeeded! All schemas and path checks passed.', type: 'success' });
      } else {
        setStatusMessage({ text: 'Validation found issues. Please review below.', type: 'error' });
      }
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Validation failed to run.', type: 'error' });
    } finally {
      setIsValidating(false);
    }
  };

  // Publish Release
  const handlePublishRelease = async () => {
    setIsPublishing(true);
    setStatusMessage(null);
    try {
      const res = await api.publishAdminComponent(slug, {
        version: publishVersion,
        changelog: publishChangelog,
      });
      setStatus('published');
      setCurrentVersion(publishVersion);
      setStatusMessage({ text: `Published release ${publishVersion} successfully!`, type: 'success' });
      setIsDirty(false);
      // Reload versions
      const vers = await api.getAdminVersions(slug);
      setVersionsList(vers);
      onPublished?.(slug);
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Publishing failed.', type: 'error' });
    } finally {
      setIsPublishing(false);
    }
  };

  // Deprecate Release State & Handlers
  const [deprecatingTarget, setDeprecatingTarget] = useState<{ version: string } | null>(null);
  const [deprecationReasonInput, setDeprecationReasonInput] = useState('');
  const [isDeprecating, setIsDeprecating] = useState(false);

  const handleConfirmDeprecateRelease = async () => {
    if (!deprecatingTarget) return;
    setIsDeprecating(true);
    setStatusMessage(null);
    try {
      await api.deprecateAdminRelease(slug, deprecatingTarget.version, deprecationReasonInput);
      setStatusMessage({
        text: `Release v${deprecatingTarget.version} has been marked as deprecated.`,
        type: 'success',
      });
      const vers = await api.getAdminVersions(slug);
      setVersionsList(vers);
      setDeprecatingTarget(null);
      setDeprecationReasonInput('');
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Deprecation failed.', type: 'error' });
    } finally {
      setIsDeprecating(false);
    }
  };

  // Add tag
  const handleAddTag = () => {
    if (newTagInput.trim() && !tags.includes(newTagInput.trim())) {
      setTags([...tags, newTagInput.trim()]);
      setNewTagInput('');
      setIsDirty(true);
    }
  };

  // Add new file
  const handleAddFile = () => {
    const p = newFilePath.trim();
    if (!p) return;
    if (files.some((f) => f.path === p)) {
      alert('A file with this path already exists.');
      return;
    }
    const name = p.split('/').pop() || p;
    const isCss = p.endsWith('.css');
    const newFile: ComponentFile = {
      path: p,
      name,
      content: isCss ? '/* Component styles */\n' : `import React from 'react';\n`,
      language: isCss ? 'css' : 'typescript',
      isEntry: false,
    };
    const updated = [...files, newFile];
    setFiles(updated);
    setActiveFileIndex(updated.length - 1);
    setNewFilePath('');
    setShowAddFileModal(false);
    setIsDirty(true);
  };

  // Remove file
  const handleRemoveFile = (index: number) => {
    if (files.length <= 1) {
      alert('A component must have at least one source file.');
      return;
    }
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    setActiveFileIndex(Math.max(0, activeFileIndex - 1));
    setIsDirty(true);
  };

  // Active file content change
  const handleContentChange = (content: string) => {
    const updated = [...files];
    updated[activeFileIndex] = {
      ...updated[activeFileIndex],
      content,
    };
    setFiles(updated);
    setIsDirty(true);
  };

  return (
    <div className="space-y-6">
      {/* Studio Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#11131A] border border-[#E8EAEF] dark:border-white/10 shadow-sm">
        <div className="flex items-center gap-3.5">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 flex items-center justify-center transition-colors shrink-0"
            title="Back to Catalog"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-[#161722] dark:text-white">
                {name || 'Untitled Component'}
              </h2>
              {slug && (
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500">
                  {slug}
                </span>
              )}
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  status === 'published'
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    : status === 'deprecated'
                    ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                    : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                }`}
              >
                {status}
              </span>
              {isDirty && (
                <span className="flex items-center gap-1 text-[11px] text-amber-500 font-medium animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Unsaved Changes
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              VAC Component Studio · Version {currentVersion} · {files.length} Source {files.length === 1 ? 'File' : 'Files'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-800 dark:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button
            onClick={handleRunValidation}
            disabled={isValidating}
            className="px-4 py-2 rounded-xl border border-[#5B4FF5]/30 bg-[#5B4FF5]/10 hover:bg-[#5B4FF5]/20 text-[#5B4FF5] text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{isValidating ? 'Validating...' : 'Validate'}</span>
          </button>

          <button
            onClick={() => setActiveTab('validation')}
            className="px-4 py-2 rounded-xl bg-[#5B4FF5] hover:bg-[#4F46E5] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publish Release</span>
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-center justify-between border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
          }`}
        >
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="text-gray-400 hover:text-white ml-2">
            ×
          </button>
        </div>
      )}

      {/* Studio Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E8EAEF] dark:border-white/10 pb-2 text-xs font-medium overflow-x-auto scrollbar-none flex-nowrap">
        <button
          onClick={() => setActiveTab('metadata')}
          className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
            activeTab === 'metadata'
              ? 'bg-[#5B4FF5] text-white shadow-xs'
              : 'text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Metadata</span>
        </button>

        <button
          onClick={() => setActiveTab('files')}
          className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
            activeTab === 'files'
              ? 'bg-[#5B4FF5] text-white shadow-xs'
              : 'text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Source Files ({files.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('dependencies')}
          className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
            activeTab === 'dependencies'
              ? 'bg-[#5B4FF5] text-white shadow-xs'
              : 'text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Dependencies & Props</span>
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
            activeTab === 'preview'
              ? 'bg-[#5B4FF5] text-white shadow-xs'
              : 'text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Live Preview</span>
        </button>

        <button
          onClick={() => setActiveTab('validation')}
          className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
            activeTab === 'validation'
              ? 'bg-[#5B4FF5] text-white shadow-xs'
              : 'text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Validation & Release</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
            activeTab === 'history'
              ? 'bg-[#5B4FF5] text-white shadow-xs'
              : 'text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Releases ({versionsList.length})</span>
        </button>
      </div>

      {/* TAB 1: METADATA */}
      {activeTab === 'metadata' && (
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#11131A] border border-[#E8EAEF] dark:border-white/10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Component Name <span className="text-[#5B4FF5]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Glowing Ambient Card"
                className="w-full text-xs p-3 rounded-2xl bg-gray-50 dark:bg-black/30 border border-[#E8EAEF] dark:border-white/10 text-[#161722] dark:text-white focus:outline-none focus:border-[#5B4FF5]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Unique Slug <span className="text-[#5B4FF5]">*</span>
              </label>
              <input
                type="text"
                value={slug}
                disabled={!isNew}
                onChange={(e) => {
                  setSlug(e.target.value.toLowerCase().trim());
                  setIsDirty(true);
                }}
                placeholder="e.g. glowing-ambient-card"
                className="w-full font-mono text-xs p-3 rounded-2xl bg-gray-50 dark:bg-black/30 border border-[#E8EAEF] dark:border-white/10 text-[#161722] dark:text-white focus:outline-none focus:border-[#5B4FF5] disabled:opacity-60"
              />
              <p className="text-[10px] text-gray-400">Used for CLI packages and catalog permalinks.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Category <span className="text-[#5B4FF5]">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setIsDirty(true);
                }}
                className="w-full text-xs p-3 rounded-2xl bg-gray-50 dark:bg-black/30 border border-[#E8EAEF] dark:border-white/10 text-[#161722] dark:text-white focus:outline-none focus:border-[#5B4FF5]"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Author & Attribution
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => {
                  setAuthor(e.target.value);
                  setIsDirty(true);
                }}
                className="w-full text-xs p-3 rounded-2xl bg-gray-50 dark:bg-black/30 border border-[#E8EAEF] dark:border-white/10 text-[#161722] dark:text-white focus:outline-none focus:border-[#5B4FF5]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Short Description <span className="text-[#5B4FF5]">*</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setIsDirty(true);
              }}
              placeholder="Concise overview explaining purpose, physics, and design token integration."
              className="w-full text-xs p-3 rounded-2xl bg-gray-50 dark:bg-black/30 border border-[#E8EAEF] dark:border-white/10 text-[#161722] dark:text-white focus:outline-none focus:border-[#5B4FF5]"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Tags</label>
            <div className="flex flex-wrap items-center gap-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-purple-500/10 text-[#5B4FF5] border border-purple-500/20"
                >
                  <Tag className="w-3 h-3" />
                  {t}
                  <button
                    onClick={() => {
                      setTags(tags.filter((tag) => tag !== t));
                      setIsDirty(true);
                    }}
                    className="hover:text-red-400 ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="+ Add tag..."
                  className="text-xs px-3 py-1 rounded-full bg-gray-50 dark:bg-black/30 border border-[#E8EAEF] dark:border-white/10 text-[#161722] dark:text-white focus:outline-none w-28"
                />
                <button
                  onClick={handleAddTag}
                  className="p-1 rounded-full text-gray-400 hover:text-white"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Documentation */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Technical Documentation (Markdown)
            </label>
            <textarea
              value={documentation}
              onChange={(e) => {
                setDocumentation(e.target.value);
                setIsDirty(true);
              }}
              rows={5}
              placeholder="Document implementation guidelines, accessibility nuances, and recommended props."
              className="w-full font-mono text-xs p-3 rounded-2xl bg-gray-50 dark:bg-black/30 border border-[#E8EAEF] dark:border-white/10 text-[#161722] dark:text-white focus:outline-none focus:border-[#5B4FF5]"
            />
          </div>
        </div>
      )}

      {/* TAB 2: SOURCE FILES */}
      {activeTab === 'files' && (
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#11131A] border border-[#E8EAEF] dark:border-white/10 space-y-4">
          {/* File selector bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8EAEF] dark:border-white/10 pb-3">
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full scrollbar-none">
              {files.map((file, idx) => (
                <button
                  key={file.path}
                  onClick={() => setActiveFileIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-2 transition-all shrink-0 ${
                    activeFileIndex === idx
                      ? 'bg-[#5B4FF5]/10 text-[#5B4FF5] border border-[#5B4FF5]/30 font-semibold'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  <FileCode className="w-3 h-3 text-[#5B4FF5]" />
                  <span>{file.name}</span>
                  {file.isEntry && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-[#5B4FF5]">
                      entry
                    </span>
                  )}
                  {files.length > 1 && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(idx);
                      }}
                      className="text-gray-400 hover:text-red-400 ml-1 text-xs"
                    >
                      ×
                    </span>
                  )}
                </button>
              ))}

              <button
                onClick={() => setShowAddFileModal(true)}
                className="px-2.5 py-1.5 rounded-xl border border-dashed border-[#E8EAEF] dark:border-white/10 text-xs text-gray-400 hover:text-white flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3 h-3" />
                <span>Add File</span>
              </button>
            </div>

            <div className="text-[11px] text-gray-400 font-mono">
              Line count: {files[activeFileIndex]?.content.split('\n').length || 0}
            </div>
          </div>

          {/* New file input popover */}
          {showAddFileModal && (
            <div className="p-3 rounded-2xl bg-gray-50 dark:bg-black/40 border border-[#E8EAEF] dark:border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={newFilePath}
                onChange={(e) => setNewFilePath(e.target.value)}
                placeholder="e.g. src/styles.css or src/utils.ts"
                className="text-xs p-2 rounded-xl bg-white dark:bg-[#11131A] border border-white/10 text-white flex-1 focus:outline-none"
              />
              <button
                onClick={handleAddFile}
                className="px-3 py-2 rounded-xl bg-[#5B4FF5] text-white text-xs font-semibold"
              >
                Create
              </button>
              <button
                onClick={() => setShowAddFileModal(false)}
                className="px-3 py-2 rounded-xl bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 text-xs"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Syntax Highlighted / Code Editor Area */}
          <div className="relative rounded-2xl border border-[#E8EAEF] dark:border-white/10 overflow-hidden bg-[#0A0B10]">
            <div className="px-4 py-2 bg-black/40 border-b border-white/5 flex items-center justify-between text-[11px] text-gray-400 font-mono">
              <span className="truncate pr-2">{files[activeFileIndex]?.path}</span>
              <span className="shrink-0">Syntax: {files[activeFileIndex]?.language}</span>
            </div>
            <textarea
              value={files[activeFileIndex]?.content || ''}
              onChange={(e) => handleContentChange(e.target.value)}
              rows={22}
              className="w-full font-mono text-xs p-4 bg-transparent text-gray-200 focus:outline-none leading-relaxed selection:bg-[#5B4FF5]/30 resize-y"
              spellCheck={false}
            />
          </div>
        </div>
      )}

      {/* TAB 3: DEPENDENCIES & PROPS */}
      {activeTab === 'dependencies' && (
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#11131A] border border-[#E8EAEF] dark:border-white/10 space-y-8">
          {/* Dependencies */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#161722] dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#5B4FF5]" />
              Declared Client Dependencies
            </h3>
            <p className="text-xs text-gray-400">
              Dependencies required by component consumers. Standard packages will be automatically bundled or installed by the CLI.
            </p>

            <div className="space-y-2">
              {Object.entries(dependencies).map(([pkg, ver]) => (
                <div
                  key={pkg}
                  className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-black/30 border border-[#E8EAEF] dark:border-white/10 font-mono text-xs"
                >
                  <span className="text-purple-400 break-all pr-2">{pkg}</span>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-gray-400">{ver}</span>
                    <button
                      onClick={() => {
                        const copy = { ...dependencies };
                        delete copy[pkg];
                        setDependencies(copy);
                        setIsDirty(true);
                      }}
                      className="text-gray-500 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Add dependency row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
                <input
                  type="text"
                  value={newDepKey}
                  onChange={(e) => setNewDepKey(e.target.value)}
                  placeholder="Package (e.g. canvas-confetti)"
                  className="text-xs p-2.5 rounded-xl bg-gray-50 dark:bg-black/30 border border-[#E8EAEF] dark:border-white/10 text-white flex-1 focus:outline-none"
                />
                <input
                  type="text"
                  value={newDepVal}
                  onChange={(e) => setNewDepVal(e.target.value)}
                  placeholder="Version (e.g. ^1.6.0)"
                  className="text-xs p-2.5 rounded-xl bg-gray-50 dark:bg-black/30 border border-[#E8EAEF] dark:border-white/10 text-white w-full sm:w-32 focus:outline-none"
                />
                <button
                  onClick={() => {
                    if (newDepKey.trim()) {
                      setDependencies({ ...dependencies, [newDepKey.trim()]: newDepVal.trim() });
                      setNewDepKey('');
                      setIsDirty(true);
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#5B4FF5] text-white text-xs font-semibold"
                >
                  Add Package
                </button>
              </div>
            </div>
          </div>

          {/* Component Props */}
          <div className="space-y-4 pt-4 border-t border-[#E8EAEF] dark:border-white/10">
            <h3 className="text-sm font-bold text-[#161722] dark:text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#5B4FF5]" />
              Documented Component Props
            </h3>

            <div className="space-y-2">
              {propsList.map((pr, idx) => (
                <div
                  key={pr.name}
                  className="p-3 rounded-2xl bg-gray-50 dark:bg-black/30 border border-[#E8EAEF] dark:border-white/10 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 font-mono flex-wrap">
                      <span className="font-semibold text-[#5B4FF5]">{pr.name}</span>
                      <span className="text-gray-400">({pr.type})</span>
                      {pr.required && (
                        <span className="text-[10px] text-rose-400 font-sans">required</span>
                      )}
                    </div>
                    <p className="text-gray-500 text-[11px]">{pr.description}</p>
                  </div>
                  <button
                    onClick={() => {
                      setPropsList(propsList.filter((_, i) => i !== idx));
                      setIsDirty(true);
                    }}
                    className="text-gray-500 hover:text-red-400 ml-2 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {/* Add prop row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
                <input
                  type="text"
                  value={newPropName}
                  onChange={(e) => setNewPropName(e.target.value)}
                  placeholder="Prop name (e.g. isCompact)"
                  className="text-xs p-2.5 rounded-xl bg-gray-50 dark:bg-black/30 border border-[#E8EAEF] dark:border-white/10 text-white flex-1 focus:outline-none"
                />
                <input
                  type="text"
                  value={newPropType}
                  onChange={(e) => setNewPropType(e.target.value)}
                  placeholder="Type (e.g. boolean)"
                  className="text-xs p-2.5 rounded-xl bg-gray-50 dark:bg-black/30 border border-[#E8EAEF] dark:border-white/10 text-white w-full sm:w-32 focus:outline-none"
                />
                <button
                  onClick={() => {
                    if (newPropName.trim()) {
                      setPropsList([
                        ...propsList,
                        { name: newPropName.trim(), type: newPropType.trim(), required: false, description: '' },
                      ]);
                      setNewPropName('');
                      setIsDirty(true);
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#5B4FF5] text-white text-xs font-semibold"
                >
                  Add Prop
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LIVE PREVIEW */}
      {activeTab === 'preview' && (
        <StudioDraftPreview
          slug={slug}
          name={name}
          description={description}
          files={files}
          props={propsList}
        />
      )}

      {/* TAB 5: VALIDATION & RELEASE */}
      {activeTab === 'validation' && (
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#11131A] border border-[#E8EAEF] dark:border-white/10 space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#161722] dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#5B4FF5]" />
              Component Verification & Release Pipeline
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Verify schema conformity, directory traversal safety, and syntax integrity before publishing an immutable catalog release.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunValidation}
              disabled={isValidating}
              className="px-5 py-2.5 rounded-2xl bg-[#5B4FF5] hover:bg-[#4F46E5] text-white text-xs font-semibold flex items-center gap-2 shadow-md transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isValidating ? 'Validating Pipeline...' : 'Run Server Validation'}</span>
            </button>
          </div>

          {/* Validation Results Report */}
          {validationReport && (
            <div
              className={`p-4 sm:p-5 rounded-2xl border ${
                validationReport.valid
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              } space-y-3`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                {validationReport.valid ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>
                  {validationReport.valid
                    ? 'All Validation Checks Passed Cleanly'
                    : `Validation Failed (${validationReport.errors.length} Issues Found)`}
                </span>
              </div>

              {!validationReport.valid && (
                <ul className="list-disc pl-5 text-xs space-y-1">
                  {validationReport.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}

              {validationReport.valid && (
                <p className="text-xs text-emerald-300">
                  Component manifest, source files, and dependencies satisfy all catalog requirements. You may now publish release {publishVersion}.
                </p>
              )}
            </div>
          )}

          {/* Immutable Release Publishing Card */}
          <div className="p-4 sm:p-6 rounded-2xl bg-gray-50/70 dark:bg-white/[0.02] border border-[#E8EAEF] dark:border-white/10 space-y-4">
            <h4 className="text-sm font-bold text-[#161722] dark:text-white">
              Publish Approved Release
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Release Version (SemVer)
                </label>
                <input
                  type="text"
                  value={publishVersion}
                  onChange={(e) => setPublishVersion(e.target.value.trim())}
                  placeholder="e.g. 1.0.0"
                  className="w-full font-mono text-xs p-3 rounded-2xl bg-white dark:bg-black/30 border border-[#E8EAEF] dark:border-white/10 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Release Changelog
                </label>
                <input
                  type="text"
                  value={publishChangelog}
                  onChange={(e) => setPublishChangelog(e.target.value)}
                  placeholder="Summary of changes included in this release"
                  className="w-full text-xs p-3 rounded-2xl bg-white dark:bg-black/30 border border-[#E8EAEF] dark:border-white/10 text-white"
                />
              </div>
            </div>

            {/* Immutability Notice & Duplicate Safeguard */}
            {versionsList.some((v) => v.version === publishVersion) ? (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  Version <strong>{publishVersion}</strong> has already been published and is immutable. Please increment the version number before publishing a new release.
                </span>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300">
                <span className="font-semibold">Immutability Notice:</span> Once published, release {publishVersion} cannot be overwritten. Any future modifications will be saved to draft and must be released under an incremented version number.
              </div>
            )}

            <button
              onClick={handlePublishRelease}
              disabled={isPublishing || versionsList.some((v) => v.version === publishVersion)}
              className="px-6 py-2.5 rounded-2xl bg-[#5B4FF5] hover:bg-[#4F46E5] text-white text-xs font-semibold flex items-center gap-2 shadow-lg transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isPublishing ? 'Publishing Release...' : 'Publish to Public Catalog'}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 6: RELEASES & HISTORY */}
      {activeTab === 'history' && (
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#11131A] border border-[#E8EAEF] dark:border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#161722] dark:text-white flex items-center gap-2">
              <History className="w-4 h-4 text-[#5B4FF5]" />
              Immutable Version Releases
            </h3>
            <span className="text-xs text-gray-400 font-mono">
              {versionsList.length} {versionsList.length === 1 ? 'release' : 'releases'} published
            </span>
          </div>

          {versionsList.length === 0 ? (
            <div className="p-8 sm:p-12 text-center text-xs text-gray-400 space-y-2">
              <Clock className="w-8 h-8 mx-auto text-gray-500 opacity-50" />
              <p>No published releases yet for this component draft.</p>
              <p className="text-[11px] text-gray-500">
                Run validation and use the Publish Release action to cut version 1.0.0.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#E8EAEF] dark:divide-white/5">
              {versionsList.map((ver) => (
                <div key={ver.version} className="py-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-sm font-bold text-[#5B4FF5]">
                        v{ver.version}
                      </span>
                      {ver.deprecated ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                          Deprecated
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                          Published
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">
                        {ver.publishedAt ? new Date(ver.publishedAt).toLocaleDateString() : 'Active'}
                      </span>
                      {!ver.deprecated && (
                        <button
                          onClick={() => setDeprecatingTarget({ version: ver.version })}
                          className="px-2.5 py-1 rounded-full text-[10px] border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-colors flex items-center gap-1 font-medium"
                          title="Deprecate this release"
                        >
                          <AlertTriangle className="w-3 h-3" />
                          <span>Deprecate</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-300">
                    {ver.changelog || 'Production component release.'}
                  </p>
                  {ver.deprecated && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                      <span>Notice: {ver.deprecationReason || 'Marked as deprecated by catalog admin.'}</span>
                    </div>
                  )}
                  <div className="text-[11px] font-mono text-gray-500 flex items-center gap-4">
                    <span>{ver.files?.length || 0} files</span>
                    <span>
                      Dependencies: {Object.keys(ver.dependencies || {}).length} declared
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Deprecation Confirmation Modal */}
          {deprecatingTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="w-full max-w-md bg-white dark:bg-[#161722] rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-[#E8EAEF] dark:border-white/10 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#161722] dark:text-white">
                      Deprecate Release v{deprecatingTarget.version}?
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Irreversible administrative action
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  This will mark release <strong className="text-white">v{deprecatingTarget.version}</strong> as deprecated in the public registry and warn developers installing or inspecting this version. The immutable source code and manifest snapshot will be preserved in permanent storage and will NOT be deleted.
                </p>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">
                    Deprecation Reason or Migration Guidance (Optional)
                  </label>
                  <input
                    type="text"
                    value={deprecationReasonInput}
                    onChange={(e) => setDeprecationReasonInput(e.target.value)}
                    placeholder="e.g. Superceded by v1.1.0 with updated React 19 types"
                    className="w-full text-xs p-3 rounded-2xl bg-gray-50 dark:bg-black/30 border border-[#E8EAEF] dark:border-white/10 text-white focus:outline-none"
                  />
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => {
                      setDeprecatingTarget(null);
                      setDeprecationReasonInput('');
                    }}
                    className="px-4 py-2 rounded-full text-xs font-semibold text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDeprecateRelease}
                    disabled={isDeprecating}
                    className="px-5 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-black text-xs font-semibold shadow-md transition-colors disabled:opacity-50"
                  >
                    {isDeprecating ? 'Deprecating...' : 'Confirm Deprecation'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
