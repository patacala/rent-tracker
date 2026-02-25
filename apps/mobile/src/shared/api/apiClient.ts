import { BASE_URL } from '@shared/api/baseUrl';
import type { NeighborhoodEntity, POIEntity } from '@features/analysis/store/analysisApi';

export type { NeighborhoodEntity, POIEntity };

async function postWithAuth<T>(endpoint: string, body: unknown, token: string) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error((error as { message?: string }).message ?? `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

async function postPublic<T>(endpoint: string, body: unknown) {
  const url = `${BASE_URL}${endpoint}`;
  console.log('API Request:', url);
  console.log('Request body:', JSON.stringify(body, null, 2));

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  console.log('Response status:', response.status);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error('API Error:', error);
    throw new Error((error as { message?: string }).message ?? `HTTP ${response.status}`);
  }

  const data = await response.json();
  console.log('API Response:', data);
  return data as T;
}

export interface AnalyzeLocationRequest {
  longitude: number;
  latitude: number;
  timeMinutes: number;
  mode: 'driving' | 'walking' | 'cycling';
}

export interface AnalyzeLocationResponse {
  neighborhoods: Array<{
    neighborhood: NeighborhoodEntity;
    pois: POIEntity[];
  }>;
  isochrone?: any;
}

export const apiClient = {
  analyzeLocation: (body: AnalyzeLocationRequest, token?: string) =>
    token
      ? postWithAuth<AnalyzeLocationResponse>('/api/neighborhoods/analyze', body, token)
      : postPublic<AnalyzeLocationResponse>('/api/neighborhoods/analyze', body),
  saveAnalysisSession: (
    token: string,
    body: {
      neighborhoodIds: string[];
      longitude: number;
      latitude: number;
      timeMinutes: number;
      mode: string;
    },
  ) => postWithAuth<{ ok: boolean }>('/api/neighborhoods/session', body, token),
};