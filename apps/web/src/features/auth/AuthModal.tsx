import React, { useState } from 'react';
import { X, Lock, Mail, User, AlertCircle } from 'lucide-react';
import { useAuth } from './authStore';
import { getOAuthUrl } from '../../lib/api';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalMode, login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(authModalMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    setMode(authModalMode);
    setError(null);
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (!name.trim()) throw new Error('Name is required');
        await register(name, email, password);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-md bg-white dark:bg-[#11131A] border border-gray-100 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#161722] dark:text-white">
            {mode === 'login' ? 'Sign in to VAC UI' : 'Create developer account'}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {mode === 'login'
              ? 'Access your saved components, collections, and preferences.'
              : 'Join the developer community to publish, customize, and save components.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200/60 text-red-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-[#161722] dark:text-gray-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Jane Developer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full h-10 pl-9 pr-3.5 rounded-full border border-gray-200 dark:border-white/10 bg-[#F5F6FA] dark:bg-[#171A23] text-xs text-[#161722] dark:text-white focus:outline-none focus:border-[#5B4FF5]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#161722] dark:text-gray-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="developer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-10 pl-9 pr-3.5 rounded-full border border-gray-200 dark:border-white/10 bg-[#F5F6FA] dark:bg-[#171A23] text-xs text-[#161722] dark:text-white focus:outline-none focus:border-[#5B4FF5]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#161722] dark:text-gray-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-10 pl-9 pr-3.5 rounded-full border border-gray-200 dark:border-white/10 bg-[#F5F6FA] dark:bg-[#171A23] text-xs text-[#161722] dark:text-white focus:outline-none focus:border-[#5B4FF5]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 px-4 rounded-full bg-[#181A25] hover:bg-black text-white text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
          >
            {isLoading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
          </button>
        </form>

        <div className="relative my-4 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-white/10" />
          </div>
          <span className="relative bg-white dark:bg-[#11131A] px-2 text-[10px] uppercase tracking-wider text-gray-400">
            or continue with
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <a
            href={getOAuthUrl('github')}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-full border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-xs font-medium text-[#161722] dark:text-white"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>GitHub</span>
          </a>

          <a
            href={getOAuthUrl('google')}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-full border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-xs font-medium text-[#161722] dark:text-white"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Google</span>
          </a>
        </div>

        <div className="mt-5 text-center text-xs text-gray-500 dark:text-gray-400">
          {mode === 'login' ? (
            <>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-[#5B4FF5] font-semibold hover:underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-[#5B4FF5] font-semibold hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
