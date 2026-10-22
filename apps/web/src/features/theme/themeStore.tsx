import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper to temporarily disable CSS transitions during theme switch to prevent visual glitching
const disableTransitionsTemporarily = () => {
  if (typeof document === 'undefined') return () => {};
  const css = document.createElement('style');
  css.setAttribute('data-theme-transition', 'true');
  css.appendChild(
    document.createTextNode(
      `*, *::before, *::after {
        -webkit-transition: none !important;
        -moz-transition: none !important;
        -o-transition: none !important;
        -ms-transition: none !important;
        transition: none !important;
      }`
    )
  );
  document.head.appendChild(css);

  return () => {
    // Force DOM reflow so styling changes commit before re-enabling transitions
    (() => window.getComputedStyle(document.body))();
    setTimeout(() => {
      if (document.head.contains(css)) {
        document.head.removeChild(css);
      }
    }, 20);
  };
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'dark';
    try {
      const saved = localStorage.getItem('vac_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {
      // Fallback
    }
    return 'dark';
  });

  useEffect(() => {
    const restoreTransitions = disableTransitionsTemporarily();
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }

    try {
      localStorage.setItem('vac_theme', theme);
    } catch {
      // Ignore storage errors in restricted contexts
    }

    restoreTransitions();
  }, [theme]);

  // Synchronize theme across multiple browser tabs
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'vac_theme' && (e.newValue === 'dark' || e.newValue === 'light')) {
        setThemeState(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const defaultThemeContext: ThemeContextType = {
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    if (typeof document !== 'undefined') {
      const isLight = document.documentElement.classList.contains('light');
      return {
        theme: (isLight ? 'light' : 'dark') as Theme,
        toggleTheme: () => {},
        setTheme: () => {},
      };
    }
    return defaultThemeContext;
  }
  return context;
};
