// ─────────────────────────────────────────────
// Relocation Intelligence — Shared Config
// ─────────────────────────────────────────────

import Constants from 'expo-constants';

export const APP_CONFIG = {
  name: 'Relocation Intelligence',
  version: '0.0.1',
  defaultCity: 'miami',
} as const;

export const API_CONFIG = {
  baseUrl:
    Constants.expoConfig?.extra?.API_BASE_URL ??
    'http://192.168.1.173:3000',
  version: 'v1',
  timeout: 10_000,
} as const;
