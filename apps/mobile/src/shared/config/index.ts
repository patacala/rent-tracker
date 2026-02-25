// ─────────────────────────────────────────────
// Relocation Intelligence — Shared Config
// ─────────────────────────────────────────────

export const APP_CONFIG = {
  name: 'Relocation Intelligence',
  version: '0.0.1',
  defaultCity: 'miami',
} as const;

export const API_CONFIG = {
  baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
  version: 'v1',
  timeout: 10_000,
} as const;
