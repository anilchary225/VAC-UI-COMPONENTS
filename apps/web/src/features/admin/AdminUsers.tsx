import React, { useState, useEffect } from 'react';
import { Users, Shield, User, RefreshCw, Key, AlertTriangle } from 'lucide-react';
import { api } from '../../lib/api';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    setError(null);
    try {
      const data = await api.getAdminUsers();
      setUsers(data);
    } catch (err: any) {
      console.error('Failed to load user directory:', err);
      setError(err?.message || 'Failed to retrieve registered accounts.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  if (isLoading) {
    return (
      <div className="p-16 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-[#5B4FF5]" />
        <span>Loading registered accounts...</span>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#11131A] border border-rose-500/20 text-rose-400 space-y-3">
        <AlertTriangle className="w-8 h-8 mx-auto text-rose-500" />
        <h3 className="text-sm font-bold text-[#161722] dark:text-white">User Directory Unavailable</h3>
        <p className="text-xs text-gray-400 max-w-md mx-auto">{error}</p>
        <button
          onClick={loadUsers}
          className="px-5 py-2 rounded-2xl bg-[#5B4FF5] text-white text-xs font-semibold hover:bg-[#4F46E5] transition-all cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#161722] dark:text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-[#5B4FF5]" />
          User Directory & Access Control
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          View registered developer accounts, administrative privileges, and social OAuth linkages.
        </p>
      </div>

      <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#11131A] border border-[#E8EAEF] dark:border-white/10 shadow-xs space-y-4">
        {users.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-400">
            No registered users found in database directory.
          </div>
        ) : (
          <div className="divide-y divide-[#E8EAEF] dark:divide-white/5">
          {users.map((u) => (
            <div key={u.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-purple-500/10 text-[#5B4FF5] flex items-center justify-center font-bold shrink-0">
                  {u.role === 'admin' ? <Shield className="w-4 h-4 text-amber-400" /> : <User className="w-4 h-4" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[#161722] dark:text-white text-sm">{u.name}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold uppercase ${
                        u.role === 'admin'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-gray-100 dark:bg-white/5 text-gray-400'
                      }`}
                    >
                      {u.role}
                    </span>
                  </div>
                  <span className="text-gray-400 text-xs font-mono">{u.email}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {u.hasGithub && (
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/5 text-[10px] font-mono">
                      GitHub Linked
                    </span>
                  )}
                  {u.hasGoogle && (
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/5 text-[10px] font-mono">
                      Google Linked
                    </span>
                  )}
                </div>
                <span className="font-mono text-[11px]">
                  Joined {new Date(u.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>
    </div>
  );
};
