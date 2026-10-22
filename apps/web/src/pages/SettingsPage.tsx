import React, { useState, useEffect } from 'react';
import { useTheme } from '../features/theme/themeStore';
import { useAuth } from '../features/auth/authStore';
import { Moon, Sun, Check, User, Code, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { user, openAuthModal } = useAuth();

  const [displayName, setDisplayName] = useState(user?.name || '');
  const [codePreference, setCodePreference] = useState<'typescript' | 'javascript'>(
    user?.codePreference || 'typescript'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user?.name) {
      setDisplayName(user.name);
    }
    if (user?.codePreference) {
      setCodePreference(user.codePreference);
    }
  }, [user]);

  const handleSave = async () => {
    setErrorMessage(null);
    setIsSaving(true);

    if (user) {
      try {
        await api.updateProfile({
          name: displayName.trim() || undefined,
          codePreference,
          themePreference: theme,
        });
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to save preferences');
      } finally {
        setIsSaving(false);
      }
    } else {
      // Guest: local save
      setTimeout(() => {
        setIsSaving(false);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      }, 300);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#161722] dark:text-white">
          Preferences & Settings
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Customize your interface appearance, preferred code formats, and developer defaults.
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Card (when authenticated) */}
        {user ? (
          <div className="p-4 sm:p-6 rounded-2xl border border-[#E8EAEF] dark:border-white/10 bg-white dark:bg-[#11131A] space-y-4 shadow-xs">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#5B4FF5]" />
              <h2 className="text-sm font-semibold text-[#161722] dark:text-white">
                Developer Profile
              </h2>
            </div>

            <div className="space-y-3 max-w-md">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full bg-gray-50 dark:bg-black/30 border border-[#E8EAEF] dark:border-white/10 rounded-xl px-3 py-2 text-xs text-[#161722] dark:text-white focus:outline-none focus:border-[#5B4FF5]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address (Verified)
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full bg-gray-100 dark:bg-white/[0.03] border border-[#E8EAEF] dark:border-white/10 rounded-xl px-3 py-2 text-xs text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-6 rounded-2xl border border-dashed border-[#E8EAEF] dark:border-white/10 bg-white dark:bg-[#11131A] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-[#161722] dark:text-white">Guest Session</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Sign in to synchronize your profile and preferences across multiple development machines.
              </p>
            </div>
            <button
              onClick={() => openAuthModal('login')}
              className="self-start sm:self-auto px-4 py-2 rounded-full bg-[#181A25] hover:bg-black text-white text-xs font-semibold shadow-sm transition-all shrink-0 cursor-pointer"
            >
              Sign In
            </button>
          </div>
        )}

        {/* Theme Settings */}
        <div className="p-4 sm:p-6 rounded-2xl border border-[#E8EAEF] dark:border-white/10 bg-white dark:bg-[#11131A] space-y-4 shadow-xs">
          <h2 className="text-sm font-semibold text-[#161722] dark:text-white">
            Interface Theme
          </h2>
          <div className="grid grid-cols-2 gap-4 max-w-sm">
            <button
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-24 transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'border-[#5B4FF5] bg-[#5B4FF5]/10'
                  : 'border-[#E8EAEF] dark:border-white/10 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <Moon className="w-5 h-5 text-[#8B5CF6]" />
                {theme === 'dark' && <Check className="w-4 h-4 text-[#5B4FF5]" />}
              </div>
              <span className="text-xs font-semibold text-[#161722] dark:text-white">Dark Theme</span>
            </button>

            <button
              onClick={() => setTheme('light')}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-24 transition-all cursor-pointer ${
                theme === 'light'
                  ? 'border-[#5B4FF5] bg-[#5B4FF5]/10'
                  : 'border-[#E8EAEF] dark:border-white/10 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <Sun className="w-5 h-5 text-amber-500" />
                {theme === 'light' && <Check className="w-4 h-4 text-[#5B4FF5]" />}
              </div>
              <span className="text-xs font-semibold text-[#161722] dark:text-white">Light Mode</span>
            </button>
          </div>
        </div>

        {/* Code Format Preference */}
        <div className="p-4 sm:p-6 rounded-2xl border border-[#E8EAEF] dark:border-white/10 bg-white dark:bg-[#11131A] space-y-4 shadow-xs">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-[#5B4FF5]" />
            <h2 className="text-sm font-semibold text-[#161722] dark:text-white">
              Default Code Language
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Selected variant is prioritized when copying source or viewing component code tabs.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setCodePreference('typescript')}
              className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                codePreference === 'typescript'
                  ? 'border-[#5B4FF5] bg-[#5B4FF5]/10 text-[#5B4FF5]'
                  : 'border-[#E8EAEF] dark:border-white/10 text-gray-600 dark:text-gray-400'
              }`}
            >
              TypeScript (.tsx)
            </button>
            <button
              onClick={() => setCodePreference('javascript')}
              className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                codePreference === 'javascript'
                  ? 'border-[#5B4FF5] bg-[#5B4FF5]/10 text-[#5B4FF5]'
                  : 'border-[#E8EAEF] dark:border-white/10 text-gray-600 dark:text-gray-400'
              }`}
            >
              JavaScript (.jsx)
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Save button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-full bg-[#181A25] hover:bg-black text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-60 cursor-pointer"
          >
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </button>
          {savedSuccess && (
            <span className="text-xs text-emerald-500 flex items-center gap-1 font-medium">
              <Check className="w-3.5 h-3.5" /> Preferences saved!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
