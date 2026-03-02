// ─────────────────────────────────────────────
// Relocation Intelligence — Shared Config
// ─────────────────────────────────────────────
import type { PriorityKey, PriorityMatchConfig } from '@rent-tracker/types';

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

// Miami bounding box for MVP
export const MIAMI_CONFIG = {
  center: { lat: 25.7617, lng: -80.1918 },
  defaultRegion: {
    lat: 25.7617,
    lng: -80.1918,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  },
  neighborhoods: [
    { id: 'brickell', name: 'Brickell', lat: 25.7593, lng: -80.1937 },
    { id: 'wynwood', name: 'Wynwood', lat: 25.8008, lng: -80.1995 },
    { id: 'coral-gables', name: 'Coral Gables', lat: 25.7215, lng: -80.2684 },
    { id: 'coconut-grove', name: 'Coconut Grove', lat: 25.7308, lng: -80.2394 },
    { id: 'little-havana', name: 'Little Havana', lat: 25.7697, lng: -80.2299 },
    { id: 'design-district', name: 'Design District', lat: 25.8124, lng: -80.1942 },
    { id: 'downtown', name: 'Downtown Miami', lat: 25.7749, lng: -80.1936 },
    { id: 'south-beach', name: 'South Beach', lat: 25.7825, lng: -80.1300 },
  ],
} as const;

export const COMMUTE_OPTIONS = [15, 30, 45, 60] as const;

// ─── POI Category Mappings ───────────────────

export const PRIORITY_TO_POI_CATEGORIES: Record<string, string[]> = {
  healthcare: ['hospital', 'medical'],
  dining: ['restaurant', 'bar', 'cafe'],
  schools: ['school'],
  parks: ['park'],
  shopping: ['shop', 'supermarket'],
  transit: ['transit', 'bus'],
  commute: ['transit'],
  safety: ['hospital', 'police'],
};

export const PRIORITY_TERM_TO_KEY: Record<string, PriorityKey> = {
  school: 'schools',      schools: 'schools',
  park: 'parks',          parks: 'parks',
  hospital: 'healthcare', medical: 'healthcare',
  healthcare: 'healthcare', health: 'healthcare',
  restaurant: 'dining',   bar: 'dining', cafe: 'dining', dining: 'dining',
  shop: 'shopping',       supermarket: 'shopping', shopping: 'shopping',
  transit: 'transit',     bus: 'transit', commute: 'transit',
  safety: 'safety',       police: 'safety',
};

export const PRIORITY_MATCH_CONFIG: Record<PriorityKey, PriorityMatchConfig> = {
  healthcare: { base: 50, idealRatio: 0.10, minIdealCount: 2, weight: 1.3 },
  schools:    { base: 50, idealRatio: 0.08, minIdealCount: 2, weight: 1.2 },
  safety:     { base: 55, idealRatio: 0.08, minIdealCount: 2, weight: 1.3 },
  parks:      { base: 45, idealRatio: 0.12, minIdealCount: 2, weight: 1.1 },
  transit:    { base: 40, idealRatio: 0.15, minIdealCount: 3, weight: 1.0 },
  shopping:   { base: 35, idealRatio: 0.18, minIdealCount: 3, weight: 0.9 },
  dining:     { base: 35, idealRatio: 0.25, minIdealCount: 4, weight: 0.8 },
  default:    { base: 40, idealRatio: 0.15, minIdealCount: 3, weight: 1.0 },
};
