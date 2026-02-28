import React, { createContext, useContext, useState } from 'react';
import type { NeighborhoodEntity, POIEntity } from '@features/analysis/store/analysisApi';

export type NeighborhoodCacheEntry = {
  neighborhood: NeighborhoodEntity;
  pois: POIEntity[];
  isFavorite: boolean;
};

interface NeighborhoodCacheContextValue {
  set: (id: string, entry: NeighborhoodCacheEntry) => void;
  get: (id: string) => NeighborhoodCacheEntry | null;
}

const NeighborhoodCacheContext = createContext<NeighborhoodCacheContextValue | null>(null);

export function NeighborhoodCacheProvider({ children }: { children: React.ReactNode }) {
  const [cache, setCache] = useState<Record<string, NeighborhoodCacheEntry>>({});

  const set = (id: string, entry: NeighborhoodCacheEntry) =>
    setCache((prev) => ({ ...prev, [id]: entry }));

  const get = (id: string) => cache[id] ?? null;

  return (
    <NeighborhoodCacheContext.Provider value={{ set, get }}>
      {children}
    </NeighborhoodCacheContext.Provider>
  );
}

export function useNeighborhoodCache() {
  const ctx = useContext(NeighborhoodCacheContext);
  if (!ctx) throw new Error('useNeighborhoodCache must be used within NeighborhoodCacheProvider');
  return ctx;
}