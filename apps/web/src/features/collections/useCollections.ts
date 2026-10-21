import { useState, useEffect, useCallback } from 'react';
import { Collection, CreateCollectionRequest } from '@vac/shared';
import { api } from '../../lib/api';
import { useAuth } from '../auth/authStore';

export const useCollections = () => {
  const { user, openAuthModal } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCollections = useCallback(async () => {
    if (!user) {
      setCollections([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.getCollections();
      setCollections(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch collections');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const createCollection = useCallback(
    async (data: CreateCollectionRequest): Promise<Collection | null> => {
      if (!user) {
        openAuthModal('login');
        return null;
      }
      try {
        const created = await api.createCollection(data);
        setCollections((prev) => [created, ...prev]);
        return created;
      } catch (err: any) {
        setError(err.message || 'Failed to create collection');
        throw err;
      }
    },
    [user, openAuthModal]
  );

  const updateCollection = useCallback(
    async (id: string, data: { name?: string; description?: string }): Promise<Collection | null> => {
      if (!user) return null;
      try {
        const updated = await api.updateCollection(id, data);
        setCollections((prev) => prev.map((c) => (c.id === id ? updated : c)));
        return updated;
      } catch (err: any) {
        setError(err.message || 'Failed to update collection');
        throw err;
      }
    },
    [user]
  );

  const deleteCollection = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user) return false;
      try {
        await api.deleteCollection(id);
        setCollections((prev) => prev.filter((c) => c.id !== id));
        return true;
      } catch (err: any) {
        setError(err.message || 'Failed to delete collection');
        throw err;
      }
    },
    [user]
  );

  const addComponentToCollection = useCallback(
    async (collectionId: string, componentSlug: string): Promise<Collection | null> => {
      if (!user) {
        openAuthModal('login');
        return null;
      }
      try {
        const updated = await api.addComponentToCollection(collectionId, componentSlug);
        setCollections((prev) => prev.map((c) => (c.id === collectionId ? updated : c)));
        return updated;
      } catch (err: any) {
        setError(err.message || 'Failed to add component to collection');
        throw err;
      }
    },
    [user, openAuthModal]
  );

  const removeComponentFromCollection = useCallback(
    async (collectionId: string, componentSlug: string): Promise<Collection | null> => {
      if (!user) return null;
      try {
        const updated = await api.removeComponentFromCollection(collectionId, componentSlug);
        setCollections((prev) => prev.map((c) => (c.id === collectionId ? updated : c)));
        return updated;
      } catch (err: any) {
        setError(err.message || 'Failed to remove component from collection');
        throw err;
      }
    },
    [user]
  );

  return {
    collections,
    loading,
    error,
    createCollection,
    updateCollection,
    deleteCollection,
    addComponentToCollection,
    removeComponentFromCollection,
    refresh: fetchCollections,
  };
};
