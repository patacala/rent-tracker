import type { Coordinates } from '@rent-tracker/types';

// ─── External Service Interfaces ─────────────
// Domain defines the contracts; infrastructure implements them

export interface Place {
  placeId: string;
  name: string;
  type: string;
  location: Coordinates;
  rating?: number;
}

export interface IPlacesService {
  searchNearby(params: {
    location: Coordinates;
    radiusMeters: number;
    types: string[];
  }): Promise<Place[]>;

  getDetails(placeId: string): Promise<Place | null>;
}

export interface RouteInfo {
  distanceKm: number;
  durationMinutes: number;
  mode: 'driving' | 'transit' | 'walking';
}

export interface IDistanceService {
  calculate(params: {
    origin: Coordinates;
    destination: Coordinates;
    mode?: 'driving' | 'transit' | 'walking';
  }): Promise<RouteInfo>;
}

// ─── Injection Tokens ────────────────────────
export const PLACES_SERVICE = 'IPlacesService';
export const DISTANCE_SERVICE = 'IDistanceService';
