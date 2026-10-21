import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../auth/authStore';

export interface RecentVisitItem {
  slug: string;
  visitedAt: string;
}

export const useRecentlyViewed = () => {
  const { user } = useAuth();
  const storageKey = user ? `vac_recent_${user.id}` : 'vac_recent_guest';

  const [history, setHistory] = useState<RecentVisitItem[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      setHistory(raw ? JSON.parse(raw) : []);
    } catch {
      setHistory([]);
    }
  }, [storageKey]);

  const recordVisit = useCallback(
    (slug: string) => {
      if (!slug) return;
      const normalized = slug.toLowerCase().trim();
      const now = new Date().toISOString();

      setHistory((prev) => {
        const filtered = prev.filter((it) => it.slug !== normalized);
        const next = [{ slug: normalized, visitedAt: now }, ...filtered].slice(0, 20);
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          // ignore localStorage errors
        }
        return next;
      });
    },
    [storageKey]
  );

  const clearHistory = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
    setHistory([]);
  }, [storageKey]);

  return {
    history,
    recordVisit,
    clearHistory,
  };
};
