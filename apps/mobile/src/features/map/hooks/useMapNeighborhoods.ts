import { useMemo } from 'react';
import { APP_CONFIG } from '@rent-tracker/config';
import { useAnalysis } from '@features/analysis/context/AnalysisContext';
import { useAuth } from '@shared/context/AuthContext';
import { useGetNeighborhoodsQuery } from '@features/analysis/store/analysisApi';
import type { NeighborhoodPreview } from '../types';

function calculateScore(poisCount: number): number {
  return Math.min(70 + Math.min(poisCount * 2, 30), 100);
}

/**
 * Computes the center of the map based on the isochrone bbox or the average
 * of neighborhood centroids. Falls back to the app's default city center.
 */
function computeCenter(
  isochrone: any | null,
  neighborhoods: NeighborhoodPreview[],
): [number, number] {
  if (isochrone?.coordinates?.[0]?.length) {
    const ring: number[][] = isochrone.coordinates[0];
    let minLng = Infinity, maxLng = -Infinity;
    let minLat = Infinity, maxLat = -Infinity;
    for (const [lng, lat] of ring) {
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }
    return [(minLng + maxLng) / 2, (minLat + maxLat) / 2];
  }

  if (neighborhoods.length > 0) {
    const avgLng = neighborhoods.reduce((s, n) => s + n.lng, 0) / neighborhoods.length;
    const avgLat = neighborhoods.reduce((s, n) => s + n.lat, 0) / neighborhoods.length;
    return [avgLng, avgLat];
  }

  return [APP_CONFIG.defaultCity === 'miami' ? -80.1918 : 0, APP_CONFIG.defaultCity === 'miami' ? 25.7617 : 0];
}

interface UseMapNeighborhoodsReturn {
  data: NeighborhoodPreview[];
  isochrone: any | null;
  center: [number, number];
}

export function useMapNeighborhoods(): UseMapNeighborhoodsReturn {
  const { analysisResult } = useAnalysis();
  const { isLoggedIn } = useAuth();

  const { data: apiData } = useGetNeighborhoodsQuery(undefined, {
    skip: !isLoggedIn,
  });

  const source = useMemo(() => {
    if (analysisResult?.neighborhoods?.length) return analysisResult.neighborhoods;
    if (isLoggedIn && apiData?.neighborhoods?.length) return apiData.neighborhoods;
    return [];
  }, [analysisResult, apiData, isLoggedIn]);

  const data = useMemo<NeighborhoodPreview[]>(() =>
    source.map((item, idx) => {
      const uniqueCategories = Array.from(
        new Set(item.pois.map((p) => p.category.toUpperCase())),
      ).slice(0, 3);

      return {
        id: item.neighborhood.id,
        name: item.neighborhood.name,
        city: APP_CONFIG.defaultCity.charAt(0).toUpperCase() + APP_CONFIG.defaultCity.slice(1),
        score: item.neighborhood.score ?? calculateScore(item.pois.length),
        tags: uniqueCategories,
        commuteMinutes: 15 + idx * 2,
        lat: (item.neighborhood as any).centerLat ?? 0,
        lng: (item.neighborhood as any).centerLng ?? 0,
      };
    }),
  [source]);

  const isochrone = analysisResult?.isochrone ?? null;
  const center = useMemo(() => computeCenter(isochrone, data), [isochrone, data]);

  return { data, isochrone, center };
}
