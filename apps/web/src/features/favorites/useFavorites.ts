import { useState, useEffect, useCallback } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../auth/authStore';

export const useFavorites = () => {
  const { user, openAuthModal } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.getFavorites();
      setFavorites(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch favorites');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const isFavorite = useCallback(
    (slug: string) => {
      return favorites.includes(slug.toLowerCase());
    },
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (slug: string) => {
      if (!user) {
        openAuthModal('login');
        return false;
      }

      const normalized = slug.toLowerCase();
      const currentlyFav = favorites.includes(normalized);
      const nextFavorites = currentlyFav
        ? favorites.filter((s) => s !== normalized)
        : [...favorites, normalized];

      // Optimistic update
      setFavorites(nextFavorites);

      try {
        if (currentlyFav) {
          await api.removeFavorite(normalized);
        } else {
          await api.addFavorite(normalized);
        }
        return !currentlyFav;
      } catch (err: any) {
        // Rollback
        setFavorites(favorites);
        setError(err.message || 'Failed to update favorite');
        return currentlyFav;
      }
    },
    [user, favorites, openAuthModal]
  );

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    loading,
    error,
    refresh: fetchFavorites,
  };
};
