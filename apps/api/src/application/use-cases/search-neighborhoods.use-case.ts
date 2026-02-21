import { Injectable, Inject, Logger } from '@nestjs/common';
import { GeoJSON } from 'geojson';
import { MIAMI_CONFIG } from '@rent-tracker/config';
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
    // Step 1: Check DB cache
    this.logger.log('Checking DB cache for neighborhoods');
    const cached = await this.neighborhoodRepo.findWithinBounds(input.polygon);
    const validCached = cached.filter(n => n.isCacheValid(7));

    if (validCached.length > 0) {
      this.logger.log(`Found ${validCached.length} valid cached neighborhoods`);
      return { neighborhoods: validCached };
    }

    // Step 2: Try Mapbox, fallback to MIAMI_CONFIG if unavailable
    let boundaries: Awaited<ReturnType<IMapboxService['searchBoundaries']>> = [];

    try {
      this.logger.log('Cache miss. Fetching from Overpass/OSM Boundaries API');
      boundaries = await this.mapboxService.searchBoundaries(input.polygon);
    } catch (error: any) {
      this.logger.error(`Overpass Boundaries API error: ${error?.message}`);
    }

    // Step 3: If Overpass returned nothing, use static Miami neighborhoods
    if (boundaries.length === 0) {
      this.logger.log('Overpass returned no results. Using static Miami neighborhoods fallback');
      const fallback = MIAMI_CONFIG.neighborhoods.map(n => ({
        id: n.id,
        name: n.name,
        boundary: this.buildPointPolygon(n.lat, n.lng),
        properties: {},
      }));

      const saved = await Promise.all(
        fallback.map(b =>
          this.neighborhoodRepo.upsert({
            id: b.id,
            name: b.name,
            boundary: b.boundary,
            source: 'static_miami_config',
            centerLat: this.calculateCenter(b.boundary).lat,
            centerLng: this.calculateCenter(b.boundary).lng,
          }),
        ),
      );

      return { neighborhoods: saved };
    }

    // Step 4: Save OSM results to DB
    this.logger.log(`Saving ${boundaries.length} neighborhoods to DB`);
    const saved = await Promise.all(
      boundaries.map(b =>
        this.neighborhoodRepo.create({
          name: b.name,
          boundary: b.boundary,
          source: 'osm_overpass',
          centerLat: this.calculateCenter(b.boundary).lat,
          centerLng: this.calculateCenter(b.boundary).lng,
        }),
      ),
    );

    return { neighborhoods: saved };
  }

  private calculateCenter(polygon: GeoJSON.Polygon): { lat: number; lng: number } {
    const coordinates = polygon.coordinates[0];

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

  private buildPointPolygon(lat: number, lng: number, radiusDeg = 0.01): GeoJSON.Polygon {
    const points = 16;
    const coords: [number, number][] = [];
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * 2 * Math.PI;
      coords.push([lng + radiusDeg * Math.cos(angle), lat + radiusDeg * Math.sin(angle)]);
    }
    coords.push(coords[0]);
    return { type: 'Polygon', coordinates: [coords] };
  }
}
