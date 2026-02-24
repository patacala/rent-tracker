import type { UserEntity } from '../entities/user.entity';
import type { UserPreferencesEntity } from '../entities/user-preferences.entity';
import type { SearchSessionEntity } from '../entities/search-session.entity';
import type { NeighborhoodEntity } from '../entities/neighborhood.entity';
import type { POIEntity, POICategory } from '../entities/poi.entity';
import type { AmenityType, CommuteOption } from '@rent-tracker/types';
import { GeoJSON } from 'geojson';

// ─── Repository Interfaces (Domain Layer) ────
// Defined in domain, implemented in infrastructure

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  create(params: { email: string; name?: string }): Promise<UserEntity>;
  update(id: string, params: Partial<{ name: string }>): Promise<UserEntity>;
  delete(id: string): Promise<void>;
}

export interface IUserPreferencesRepository {
  findByUserId(userId: string): Promise<UserPreferencesEntity | null>;
  upsert(params: {
    userId: string;
    workLat: number;
    workLng: number;
    maxCommuteMinutes: CommuteOption;
    amenities: AmenityType[];
    hasFamily: boolean;
  }): Promise<UserPreferencesEntity>;
}

export interface ISearchSessionRepository {
  /** Save a new analysis session for a user */
  save(params: {
    userId: string;
    longitude: number;
    latitude: number;
    timeMinutes: number;
    mode: string;
    neighborhoodIds: string[];
  }): Promise<void>;

  /** Return the most recent session for a user, or null if none exists */
  findLatestByUserId(userId: string): Promise<{
    neighborhoodIds: string[];
    longitude: number;
    latitude: number;
    timeMinutes: number;
    mode: string;
    createdAt: Date;
  } | null>;
}

export interface INeighborhoodRepository {
  findById(id: string): Promise<NeighborhoodEntity | null>;
  findByName(name: string): Promise<NeighborhoodEntity | null>;

  // Geospatial queries
  findWithinBounds(polygon: GeoJSON.Polygon): Promise<NeighborhoodEntity[]>;
  findNearPoint(lat: number, lng: number, radiusKm: number): Promise<NeighborhoodEntity[]>;

  // CRUD
  create(params: {
    name: string;
    boundary: GeoJSON.Polygon;
    source: 'mapbox_tilequery' | 'mapbox_boundaries' | 'osm_overpass' | 'static_miami_config' | 'manual';
    centerLat: number;
    centerLng: number;
  }): Promise<NeighborhoodEntity>;

  upsert(params: {
    id: string;
    name: string;
    boundary: GeoJSON.Polygon;
    source: 'mapbox_tilequery' | 'mapbox_boundaries' | 'osm_overpass' | 'static_miami_config' | 'manual';
    centerLat: number;
    centerLng: number;
  }): Promise<NeighborhoodEntity>;

  update(
    id: string,
    params: Partial<{
      name: string;
      boundary: GeoJSON.Polygon;
      photoUrl: string;
      cachedAt: Date;
    }>,
  ): Promise<NeighborhoodEntity>;

  delete(id: string): Promise<void>;

  // Cache management
  deleteStaleCache(olderThanDays: number): Promise<number>;
}

export interface IPOIRepository {
  findById(id: string): Promise<POIEntity | null>;
  findByNeighborhood(neighborhoodId: string): Promise<POIEntity[]>;
  findByNeighborhoodAndCategory(
    neighborhoodId: string,
    category: POICategory,
  ): Promise<POIEntity[]>;

  // Batch operations
  createMany(
    pois: Array<{
      neighborhoodId: string;
      category: POICategory;
      name: string;
      latitude: number;
      longitude: number;
      metadata?: Record<string, any>;
      mapboxId?: string;
    }>,
  ): Promise<POIEntity[]>;

  // Cache management
  deleteByNeighborhood(neighborhoodId: string): Promise<number>;
  deleteStaleCache(olderThanHours: number): Promise<number>;
}

export interface IFavoriteNeighborhoodRepository {
  save(params: { userId: string; neighborhoodId: string }): Promise<void>;
  delete(params: { userId: string; neighborhoodId: string }): Promise<void>;
  findByUserId(userId: string): Promise<{ neighborhoodId: string; createdAt: Date }[]>;
  isFavorite(params: { userId: string; neighborhoodId: string }): Promise<boolean>;
}

// ─── Injection Tokens ────────────────────────
export const USER_REPOSITORY = 'IUserRepository';
export const USER_PREFERENCES_REPOSITORY = 'IUserPreferencesRepository';
export const SEARCH_SESSION_REPOSITORY = 'ISearchSessionRepository';
export const NEIGHBORHOOD_REPOSITORY = 'INeighborhoodRepository';
export const POI_REPOSITORY = 'IPOIRepository';
export const FAVORITE_NEIGHBORHOOD_REPOSITORY = 'IFavoriteNeighborhoodRepository';
