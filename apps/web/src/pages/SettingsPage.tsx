import React, { useState } from 'react';
import { useTheme } from '../features/theme/themeStore';
import { useAuth } from '../features/auth/authStore';
import { Button } from '../components/ui/Button';
import { Moon, Sun, Check, Monitor } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [codePreference, setCodePreference] = useState<'typescript' | 'javascript'>('typescript');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Preferences & Settings
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Customize your interface appearance, preferred code formats, and developer defaults.
        </p>
      </div>

      <div className="space-y-6">
        {/* Theme Settings */}
        <div className="p-6 rounded-panel border border-[#E7E9F0] dark:border-white/10 bg-white dark:bg-[#11131A] space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            Interface Theme
          </h2>
          <div className="grid grid-cols-2 gap-4 max-w-sm">
            <button
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-btn border text-left flex flex-col justify-between h-24 transition-all ${
                theme === 'dark'
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-[#E7E9F0] dark:border-white/10 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <Moon className="w-5 h-5 text-indigo-400" />
                {theme === 'dark' && <Check className="w-4 h-4 text-indigo-400" />}
              </div>
              <span className="text-xs font-medium text-gray-900 dark:text-white">Dark First</span>
            </button>

            <button
              onClick={() => setTheme('light')}
              className={`p-4 rounded-btn border text-left flex flex-col justify-between h-24 transition-all ${
                theme === 'light'
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-[#E7E9F0] dark:border-white/10 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <Sun className="w-5 h-5 text-amber-500" />
                {theme === 'light' && <Check className="w-4 h-4 text-indigo-600" />}
              </div>
              <span className="text-xs font-medium text-gray-900 dark:text-white">Light Mode</span>
            </button>
          </div>
        </div>

        {/* Code Format Preference */}
        <div className="p-6 rounded-panel border border-[#E7E9F0] dark:border-white/10 bg-white dark:bg-[#11131A] space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            Default Code Language
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Selected variant is prioritized when copying source or viewing code tabs.
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCodePreference('typescript')}
              className={`px-4 py-2 rounded-btn text-xs font-medium border transition-colors ${
                codePreference === 'typescript'
                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500'
                  : 'border-[#E7E9F0] dark:border-white/10 text-gray-600 dark:text-gray-400'
              }`}
            >
              TypeScript (.tsx)
            </button>
            <button
              onClick={() => setCodePreference('javascript')}
              className={`px-4 py-2 rounded-btn text-xs font-medium border transition-colors ${
                codePreference === 'javascript'
                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500'
                  : 'border-[#E7E9F0] dark:border-white/10 text-gray-600 dark:text-gray-400'
              }`}
            >
              JavaScript (.jsx)
            </button>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center gap-3">
          <Button onClick={handleSave} variant="primary" size="md">
            Save Preferences
          </Button>
          {savedSuccess && (
            <span className="text-xs text-emerald-500 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Preferences saved!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
