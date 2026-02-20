import { BASE_URL } from '@shared/api/baseUrl';

async function post<T>(endpoint: string, body: unknown) {
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
}

export const apiClient = {
  createUser: (body: any) => post('/users', body),
  savePreferences: (body: any) => post('/preferences', body),
  calculateLifestyleScore: (body: any) => post('/lifestyle-score', body),
};
