import React, { useState } from 'react';
import {
  FolderHeart,
  Plus,
  Lock,
  Trash2,
  Edit2,
  Folder,
  ArrowRight,
  ArrowLeft,
  X,
  Check,
  Terminal,
} from 'lucide-react';
import { useAuth } from '../features/auth/authStore';
import { useCollections } from '../features/collections/useCollections';
import { Link, useNavigate } from 'react-router-dom';
import { Collection } from '@vac/shared';

const CATALOG_COMPONENTS_MAP: Record<string, { title: string; category: string; cli: string }> = {
  'animated-login-form': {
    title: 'Animated Login Form',
    category: 'Auth & Form Fields',
    cli: 'npx vac-ui-components add animated-login-form',
  },
  'glassmorphism-navbar': {
    title: 'Glassmorphism Navbar',
    category: 'Navigation Shells',
    cli: 'npx vac-ui-components add glassmorphism-navbar',
  },
  'interactive-pricing': {
    title: 'Interactive Pricing Tier',
    category: 'Tactile Micro-UX',
    cli: 'npx vac-ui-components add interactive-pricing',
  },
  'analytics-dashboard': {
    title: 'Analytics Metrics Matrix',
    category: 'Telemetry & Charts',
    cli: 'npx vac-ui-components add analytics-dashboard',
  },
  'notification-center': {
    title: 'Notification Center Feed',
    category: 'Feedback & Loaders',
    cli: 'npx vac-ui-components add notification-center',
  },
  'file-upload': {
    title: 'Drag & Drop File Upload',
    category: 'Auth & Form Fields',
    cli: 'npx vac-ui-components add file-upload',
  },
  'glass-button': {
    title: 'Glass Pill Button',
    category: 'Action Triggers',
    cli: 'npx vac-ui-components add glass-button',
  },
  'toggle-switch': {
    title: 'Animated Toggle Switch',
    category: 'Action Triggers',
    cli: 'npx vac-ui-components add toggle-switch',
  },
  'dark-glass-card': {
    title: 'Spotlight Ambient Card',
    category: 'Surface Cards',
    cli: 'npx vac-ui-components add dark-glass-card',
  },
};

export const CollectionsPage: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const {
    collections,
    loading,
    createCollection,
    updateCollection,
    deleteCollection,
    removeComponentFromCollection,
  } = useCollections();

  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColDesc, setNewColDesc] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

  const [editModalCol, setEditModalCol] = useState<Collection | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const navigate = useNavigate();

  const copyCli = (command: string, slug: string) => {
    navigator.clipboard.writeText(command);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 rounded-full bg-purple-500/10 text-[#5B4FF5] flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-[#161722] dark:text-white">
          Sign in to manage custom collections
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 mb-6 max-w-sm mx-auto">
          Group components into private project boards (e.g. "SaaS Platform", "E-Commerce", "Admin Portal").
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-5 py-2.5 rounded-full bg-[#181A25] hover:bg-black text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
        >
          Sign In to Account
        </button>
      </div>
    );
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    setCreateError(null);
    try {
      await createCollection({ name: newColName.trim(), description: newColDesc.trim() || undefined });
      setNewColName('');
      setNewColDesc('');
      setCreateModalOpen(false);
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create collection');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalCol || !editName.trim()) return;
    try {
      await updateCollection(editModalCol.id, { name: editName.trim(), description: editDesc.trim() });
      setEditModalCol(null);
    } catch {
      // ignore
    }
  };

  const activeCollection = collections.find((c) => c.id === activeCollectionId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Detail View of a Single Collection */}
      {activeCollection ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveCollectionId(null)}
              className="text-xs font-medium text-gray-500 hover:text-[#5B4FF5] flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Collections
            </button>
            <span className="text-xs text-gray-400">
              {activeCollection.items.length} component{activeCollection.items.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#11131A] border border-[#E8EAEF] dark:border-white/10 space-y-2">
            <div className="flex items-center gap-2">
              <Folder className="w-5 h-5 text-[#5B4FF5]" />
              <h2 className="text-xl font-bold text-[#161722] dark:text-white">
                {activeCollection.name}
              </h2>
            </div>
            {activeCollection.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {activeCollection.description}
              </p>
            )}
          </div>

          {activeCollection.items.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-dashed border-[#E8EAEF] dark:border-white/10 p-8 bg-white dark:bg-[#11131A]">
              <FolderHeart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-[#161722] dark:text-white">This collection is empty</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto mb-4">
                Explore the component catalog and click the folder icon inside any component to save it here.
              </p>
              <Link to="/components">
                <button className="px-4 py-2 rounded-full border border-gray-200 dark:border-white/10 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 inline-flex items-center gap-1.5 transition-all">
                  Browse Components <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {activeCollection.items.map((it) => {
                const info = CATALOG_COMPONENTS_MAP[it.componentSlug];
                return (
                  <div
                    key={it.componentSlug}
                    onClick={() => navigate(`/components/${it.componentSlug}`)}
                    className="group p-5 rounded-2xl bg-white dark:bg-[#11131A] border border-[#E8EAEF] dark:border-white/10 hover:border-[#5B4FF5]/50 transition-all shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#5B4FF5] bg-[#5B4FF5]/10 px-2 py-0.5 rounded-full font-medium">
                        {info?.category || 'Component'}
                      </span>
                      <h4 className="text-sm font-bold text-[#161722] dark:text-white group-hover:text-[#5B4FF5] transition-colors mt-2">
                        {info?.title || it.componentSlug}
                      </h4>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-[#E8EAEF] dark:border-white/5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyCli(info?.cli || `npx vac-ui-components add ${it.componentSlug}`, it.componentSlug);
                        }}
                        className="px-3 py-1.5 rounded-full bg-[#181A25] hover:bg-black text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        {copiedSlug === it.componentSlug ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Terminal className="w-3.5 h-3.5 text-purple-300" />
                            <span>Copy CLI</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          await removeComponentFromCollection(activeCollection.id, it.componentSlug);
                        }}
                        className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Remove from collection"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Overview of All Collections */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#161722] dark:text-white">
                Custom Collections
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Organize UI components by project board and workflow ({collections.length} created).
              </p>
            </div>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-4 py-2 rounded-full bg-[#181A25] hover:bg-black text-white text-xs font-medium flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              New Collection
            </button>
          </div>

          {loading ? (
            <div className="py-20 text-center text-xs text-gray-400">Loading collections...</div>
          ) : collections.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-dashed border-[#E8EAEF] dark:border-white/10 p-8 bg-white dark:bg-[#11131A]">
              <FolderHeart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-[#161722] dark:text-white">No collections created</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto mb-4">
                Create your first collection to group components for your upcoming projects.
              </p>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="px-4 py-2 rounded-full bg-[#5B4FF5] hover:bg-[#4D40E6] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Create Collection
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {collections.map((col) => (
                <div
                  key={col.id}
                  onClick={() => setActiveCollectionId(col.id)}
                  className="group p-5 rounded-2xl bg-white dark:bg-[#11131A] border border-[#E8EAEF] dark:border-white/10 hover:border-[#5B4FF5]/50 transition-all shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-[#5B4FF5] flex items-center justify-center">
                        <Folder className="w-4 h-4" />
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditModalCol(col);
                            setEditName(col.name);
                            setEditDesc(col.description || '');
                          }}
                          className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                          title="Rename collection"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete collection "${col.name}"?`)) {
                              await deleteCollection(col.id);
                            }
                          }}
                          className="p-1 rounded-full text-gray-400 hover:text-red-500"
                          title="Delete collection"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-[#161722] dark:text-white group-hover:text-[#5B4FF5] transition-colors truncate">
                      {col.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                      {col.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs text-gray-400 border-t border-[#E8EAEF] dark:border-white/5 font-mono">
                    <span>{col.items?.length || 0} items</span>
                    <span className="text-[#5B4FF5] flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                      Open <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Collection Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#11131A] rounded-2xl p-6 border border-[#E8EAEF] dark:border-white/10 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#161722] dark:text-white">Create New Collection</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {createError && (
              <p className="text-xs text-red-500 bg-red-500/10 p-2 rounded-lg">{createError}</p>
            )}

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Collection Name</label>
                <input
                  type="text"
                  required
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  placeholder="e.g. SaaS Admin Panel"
                  className="w-full bg-gray-50 dark:bg-black/40 border border-[#E8EAEF] dark:border-white/10 rounded-xl px-3 py-2 text-xs text-[#161722] dark:text-white focus:outline-none focus:border-[#5B4FF5]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Description (Optional)</label>
                <textarea
                  value={newColDesc}
                  onChange={(e) => setNewColDesc(e.target.value)}
                  rows={2}
                  placeholder="Supporting notes for this collection"
                  className="w-full bg-gray-50 dark:bg-black/40 border border-[#E8EAEF] dark:border-white/10 rounded-xl px-3 py-2 text-xs text-[#161722] dark:text-white focus:outline-none focus:border-[#5B4FF5]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-gray-200 dark:border-white/10 text-xs font-medium text-gray-600 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full bg-[#5B4FF5] hover:bg-[#4D40E6] text-white text-xs font-semibold"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Collection Modal */}
      {editModalCol && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#11131A] rounded-2xl p-6 border border-[#E8EAEF] dark:border-white/10 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#161722] dark:text-white">Rename Collection</h3>
              <button onClick={() => setEditModalCol(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Collection Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-black/40 border border-[#E8EAEF] dark:border-white/10 rounded-xl px-3 py-2 text-xs text-[#161722] dark:text-white focus:outline-none focus:border-[#5B4FF5]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-gray-50 dark:bg-black/40 border border-[#E8EAEF] dark:border-white/10 rounded-xl px-3 py-2 text-xs text-[#161722] dark:text-white focus:outline-none focus:border-[#5B4FF5]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditModalCol(null)}
                  className="px-4 py-2 rounded-full border border-gray-200 dark:border-white/10 text-xs font-medium text-gray-600 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full bg-[#5B4FF5] hover:bg-[#4D40E6] text-white text-xs font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
