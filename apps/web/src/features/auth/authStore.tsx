import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '@vac/shared';
import { api } from '../../lib/api';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  isAuthModalOpen: boolean;
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  authModalMode: 'login' | 'register';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    // Check for OAuth callback token or error in URL fragment (#token=...) or query
    if (typeof window !== 'undefined') {
      let token: string | null = null;
      let oauthError: string | null = null;

      // 1. Primary secure extraction from URL fragment
      if (window.location.hash) {
        const hashRaw = window.location.hash.startsWith('#')
          ? window.location.hash.slice(1)
          : window.location.hash;
        const hashParams = new URLSearchParams(hashRaw);
        token = hashParams.get('token');
        oauthError = hashParams.get('oauth_error');
      }

      // 2. Fallback check for query parameters (for backwards compatibility)
      const searchParams = new URLSearchParams(window.location.search);
      if (!token) {
        token = searchParams.get('token');
      }
      if (!oauthError) {
        oauthError = searchParams.get('oauth_error');
      }

      if (token) {
        api.setToken(token);
      }

      // 3. Immediately sanitize address bar by stripping token and error from both hash and query
      const hadTokenInHash = window.location.hash.includes('token=');
      const hadErrorInHash = window.location.hash.includes('oauth_error=');
      const hadTokenInQuery = searchParams.has('token');
      const hadErrorInQuery = searchParams.has('oauth_error');

      if (hadTokenInHash || hadErrorInHash || hadTokenInQuery || hadErrorInQuery) {
        searchParams.delete('token');
        searchParams.delete('oauth_error');
        const cleanSearch = searchParams.toString();
        const cleanUrl = window.location.pathname + (cleanSearch ? `?${cleanSearch}` : '');
        window.history.replaceState({}, document.title, cleanUrl);
      }
    }

    const token = api.getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    api
      .getCurrentUser()
      .then((profile) => setUser(profile))
      .catch(() => {
        api.logout();
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login({ email, pass });
    setUser(res.user);
    setIsAuthModalOpen(false);
  };

  const register = async (name: string, email: string, pass: string) => {
    const res = await api.register({ name, email, pass });
    setUser(res.user);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
