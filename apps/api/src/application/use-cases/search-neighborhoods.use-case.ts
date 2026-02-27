import { Injectable, Inject, Logger } from '@nestjs/common';
import { GeoJSON } from 'geojson';
import {
  NEIGHBORHOOD_REPOSITORY,
  type INeighborhoodRepository,
} from '../../domain/repositories';
import {
  MAPBOX_SERVICE,
  type IMapboxService,
} from '../../domain/services/external-services.interface';
import type { NeighborhoodEntity } from '../../domain/entities/neighborhood.entity';

export interface SearchNeighborhoodsInput {
  polygon: GeoJSON.Polygon;
  limit?: number;
}

export interface SearchNeighborhoodsOutput {
  neighborhoods: NeighborhoodEntity[];
}

@Injectable()
export class SearchNeighborhoodsUseCase {
  private readonly logger = new Logger(SearchNeighborhoodsUseCase.name);

  constructor(
    @Inject(NEIGHBORHOOD_REPOSITORY)
    private readonly neighborhoodRepo: INeighborhoodRepository,
    @Inject(MAPBOX_SERVICE)
    private readonly mapboxService: IMapboxService,
  ) {}

  async execute(input: SearchNeighborhoodsInput): Promise<SearchNeighborhoodsOutput> {
    // Step 1: Check DB cache only for free-tier (when limit is set).
    // Logged-in users (no limit) always hit Overpass so they get the full set; cache may
    // have been populated by a limited request and would cap results incorrectly.
    const useCache = input.limit !== undefined;
    if (useCache) {
      this.logger.log('Checking DB cache for neighborhoods');
      const cached = await this.neighborhoodRepo.findWithinBounds(input.polygon);
      const validCached = cached.filter(n => n.isCacheValid(7));

      if (validCached.length > 0) {
        this.logger.log(`Cache hit: ${validCached.length} neighborhoods in bbox`);
        const capped = validCached.slice(0, input.limit!);
        return { neighborhoods: capped };
      }
    } else {
      this.logger.log('Skipping cache (logged-in user); fetching full set from Overpass');
    }

    // Step 2: Fetch from Overpass/OSM — return empty list on failure
    let boundaries: Awaited<ReturnType<IMapboxService['searchBoundaries']>> = [];

    try {
      this.logger.log('Cache miss. Fetching from Overpass/OSM Boundaries API');
      boundaries = await this.mapboxService.searchBoundaries(input.polygon, input.limit);
    } catch (error: any) {
      this.logger.error(`Overpass Boundaries API error: ${error?.message}`);
      return { neighborhoods: [] };
    }

    if (boundaries.length === 0) {
      this.logger.warn('Overpass returned no neighborhoods for this area');
      return { neighborhoods: [] };
    }

    // Point-in-polygon filter disabled — use all boundaries returned by Overpass (bbox)
    this.logger.log(`Using ${boundaries.length} neighborhoods from Overpass (no isochrone filter)`);

    const limited = input.limit ? boundaries.slice(0, input.limit) : boundaries;

    // Step 3: Save OSM results to DB
    this.logger.log(`Saving ${limited.length} neighborhoods to DB`);
    const saved = await Promise.all(
      limited.map(async b => {
        const center = this.calculateCenter(b.boundary);

        const existing = await this.neighborhoodRepo.findByNameAndCoords(
          b.name,
          center.lat,
          center.lng,
        );

        if (existing) {
          this.logger.log(`Reusing existing neighborhood: ${existing.name} (${existing.id})`);
          return existing;
        }

        return this.neighborhoodRepo.create({
          name: b.name,
          boundary: b.boundary,
          source: 'osm_overpass',
          centerLat: center.lat,
          centerLng: center.lng,
        });
      }),
    );

    return { neighborhoods: saved };
  }

  /**
   * Centroid of the polygon's outer ring (arithmetic mean of vertices).
   * GeoJSON ring is [lng, lat]; closed rings repeat the first point at the end.
   */
  private calculateCenter(polygon: GeoJSON.Polygon): { lat: number; lng: number } {
    const coordinates = polygon.coordinates[0];
    if (!coordinates?.length) {
      return { lat: 0, lng: 0 };
    }

    let sumLat = 0, sumLng = 0;
    for (const [lng, lat] of coordinates) {
      sumLat += lat;
      sumLng += lng;
    }

    return {
      lat: sumLat / coordinates.length,
      lng: sumLng / coordinates.length,
    };
  }

  /**
   * Point-in-polygon by ray casting (currently disabled — not used in execute).
   * Kept for possible re-enable: filter neighborhoods to those whose centroid is inside the isochrone.
   */
  private isPointInPolygon(lat: number, lng: number, polygon: GeoJSON.Polygon): boolean {
    const ring = polygon.coordinates[0];
    if (!ring || ring.length < 3) return false;

    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i][0], yi = ring[i][1]; // [lng, lat]
      const xj = ring[j][0], yj = ring[j][1];

      const spansLat = yi > lat !== yj > lat;
      if (!spansLat) continue;
      const crossLng = (xj - xi) * (lat - yi) / (yj - yi) + xi; // safe: yj !== yi when spansLat
      if (lng < crossLng) inside = !inside;
    }

    return inside;
  }
}
