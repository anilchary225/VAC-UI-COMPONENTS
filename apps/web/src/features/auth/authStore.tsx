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
    // Check for OAuth callback token or error in URL query
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get('token');
      const oauthError = urlParams.get('oauth_error');

      if (tokenFromUrl) {
        api.setToken(tokenFromUrl);
        urlParams.delete('token');
        const newSearch = urlParams.toString();
        const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '') + window.location.hash;
        window.history.replaceState({}, document.title, newUrl);
      } else if (oauthError) {
        urlParams.delete('oauth_error');
        const newSearch = urlParams.toString();
        const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '') + window.location.hash;
        window.history.replaceState({}, document.title, newUrl);
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
