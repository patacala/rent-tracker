import type { Coordinates } from '@rent-tracker/types';
import { GeoJSON } from 'geojson';
import type { POICategory } from '../entities/poi.entity';

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

export interface IsochroneParams {
  longitude: number;
  latitude: number;
  timeMinutes: number;
  mode: 'driving' | 'walking' | 'cycling' | 'driving-traffic';
}

export interface IsochroneResult {
  polygon: GeoJSON.Polygon;
  timeMinutes: number;
  mode: string;
}

export interface BoundaryFeature {
  id: string;
  name: string;
  boundary: GeoJSON.Polygon;
  properties: Record<string, any>;
}

export interface POIFeature {
  id: string;
  name: string;
  category: POICategory;
  latitude: number;
  longitude: number;
  properties: Record<string, any>;
}

export interface IMapboxService {
  // Isochrone API
  getIsochrone(params: IsochroneParams): Promise<IsochroneResult>;

  // OSM / Overpass - Boundaries
  searchBoundaries(polygon: GeoJSON.Polygon, limit?: number): Promise<BoundaryFeature[]>;

  // OSM / Overpass - POIs for a single neighbourhood boundary
  searchPOIs(params: {
    boundary: GeoJSON.Polygon;
    categories: POICategory[];
  }): Promise<POIFeature[]>;

  // OSM / Overpass - ALL POIs inside the isochrone in one shot (avoids N parallel calls)
  searchPOIsForArea(params: {
    polygon: GeoJSON.Polygon;
    categories: POICategory[];
  }): Promise<POIFeature[]>;
}

// ─── Injection Tokens ────────────────────────
export const PLACES_SERVICE = 'IPlacesService';
export const DISTANCE_SERVICE = 'IDistanceService';
export const MAPBOX_SERVICE = 'IMapboxService';
