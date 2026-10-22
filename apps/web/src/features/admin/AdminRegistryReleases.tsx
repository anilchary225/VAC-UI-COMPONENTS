import React, { useState, useEffect } from 'react';
import { PackageCheck, Copy, Check, ExternalLink, Download, AlertCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { api } from '../../lib/api';

export const AdminRegistryReleases: React.FC = () => {
  const [releases, setReleases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const loadReleases = async () => {
    setError(null);
    try {
      const data = await api.getAdminRegistry();
      setReleases(data);
    } catch (err: any) {
      console.error('Failed to load registry releases:', err);
      setError(err?.message || 'Failed to retrieve published releases.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReleases();
  }, []);

  const copyCliCommand = (slug: string, version: string) => {
    const cmd = `npx vac-ui-components add ${slug} --version ${version}`;
    navigator.clipboard.writeText(cmd);
    setCopiedSlug(`${slug}@${version}`);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="p-16 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-[#5B4FF5]" />
        <span>Loading immutable registry manifests...</span>
      </div>
    );
  }

  if (error && releases.length === 0) {
    return (
      <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#11131A] border border-rose-500/20 text-rose-400 space-y-3">
        <AlertTriangle className="w-8 h-8 mx-auto text-rose-500" />
        <h3 className="text-sm font-bold text-[#161722] dark:text-white">Registry Manifests Unavailable</h3>
        <p className="text-xs text-gray-400 max-w-md mx-auto">{error}</p>
        <button
          onClick={loadReleases}
          className="px-5 py-2 rounded-2xl bg-[#5B4FF5] text-white text-xs font-semibold hover:bg-[#4F46E5] transition-all cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#161722] dark:text-white flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-emerald-500" />
            Registry Releases & Artifact Storage
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Immutable version releases published to the registry, complete with SHA-256 manifest integrity hashes.
          </p>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-[#11131A] border border-[#E8EAEF] dark:border-white/10 shadow-xs space-y-4">
        {releases.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-400">No releases published to the registry yet.</div>
        ) : (
          <div className="divide-y divide-[#E8EAEF] dark:divide-white/5">
            {releases.map((rel, idx) => {
              const key = `${rel.componentSlug}@${rel.version}`;
              const isCopied = copiedSlug === key;

              return (
                <div key={idx} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-sm font-bold text-[#161722] dark:text-white">
                        {rel.componentSlug}
                      </span>
                      <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-[#5B4FF5] border border-purple-500/20">
                        v{rel.version}
                      </span>
                      {rel.deprecated && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          Deprecated
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 text-[11px] max-w-xl truncate">
                      {rel.changelog || 'Immutable release manifest'}
                    </p>
                    <div className="text-[10px] text-gray-400 font-mono">
                      Published: {rel.publishedAt ? new Date(rel.publishedAt).toLocaleString() : 'Active'} · Files: {rel.files?.length || 1}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => copyCliCommand(rel.componentSlug, rel.version)}
                      className="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 hover:border-[#5B4FF5] text-[11px] font-mono text-gray-700 dark:text-gray-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                      title="Copy CLI install command"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Copied CLI Command' : 'Copy CLI'}</span>
                    </button>

                    <a
                      href={`/api/registry/components/${rel.componentSlug}/${rel.version}/manifest`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-[#5B4FF5]/10 text-[#5B4FF5] hover:bg-[#5B4FF5]/20 text-[11px] font-medium flex items-center gap-1 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Manifest JSON</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
