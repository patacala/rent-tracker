import { API_CONFIG } from '@rent-tracker/config';
import type {
  ApiResponse,
  CreateUserRequest,
  CreateUserResponse,
  SavePreferencesRequest,
  SavePreferencesResponse,
  CalculateLifestyleScoreRequest,
  CalculateLifestyleScoreResponse,
} from '@rent-tracker/types';

// ─── Typed API Client ─────────────────────────

const BASE_URL = `${API_CONFIG.baseUrl}`;

async function post<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(API_CONFIG.timeout) as unknown as RequestInit['signal'],
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error((error as { message?: string }).message ?? `HTTP ${response.status}`);
  }

  return response.json() as Promise<ApiResponse<T>>;
}

// ─── Endpoint Methods ─────────────────────────

export const apiClient = {
  createUser: (body: CreateUserRequest): Promise<ApiResponse<CreateUserResponse>> =>
    post<CreateUserResponse>('/users', body),

  savePreferences: (body: SavePreferencesRequest): Promise<ApiResponse<SavePreferencesResponse>> =>
    post<SavePreferencesResponse>('/preferences', body),

  calculateLifestyleScore: (
    body: CalculateLifestyleScoreRequest,
  ): Promise<ApiResponse<CalculateLifestyleScoreResponse>> =>
    post<CalculateLifestyleScoreResponse>('/lifestyle-score', body),
};
