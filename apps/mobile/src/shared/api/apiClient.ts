import { BASE_URL } from '@shared/api/baseUrl';

/* async function post<T>(endpoint: string, body: unknown) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error((error as { message?: string }).message ?? `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
} */

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

export interface AnalyzeLocationRequest {
  longitude: number;
  latitude: number;
  timeMinutes: number;
  mode: 'driving' | 'walking' | 'cycling';
}

export interface POIEntity {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
}

export interface NeighborhoodEntity {
  id: string;
  name: string;
  score?: number;
  boundary?: any;
}

export interface AnalyzeLocationResponse {
  neighborhoods: Array<{
    neighborhood: NeighborhoodEntity;
    pois: POIEntity[];
  }>;
}

async function postPublic<T>(endpoint: string, body: unknown) {
  const url = `${BASE_URL}${endpoint}`;
  console.log('API Request:', url);
  console.log('Request body:', JSON.stringify(body, null, 2));

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
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

export const apiClient = {
  /* createUser: (body: any) => post('/users', body),
  savePreferences: (body: any) => post('/preferences', body),
  calculateLifestyleScore: (body: any) => post('/lifestyle-score', body), */
  analyzeLocation: (body: AnalyzeLocationRequest) =>
    postPublic<AnalyzeLocationResponse>('/api/neighborhoods/analyze', body),
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
