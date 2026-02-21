import { Injectable, Logger, Inject } from '@nestjs/common';
import { GeoJSON } from 'geojson';
import { GetIsochroneUseCase } from './get-isochrone.use-case';
import { SearchNeighborhoodsUseCase } from './search-neighborhoods.use-case';
import {
  MAPBOX_SERVICE,
  type IMapboxService,
  type POIFeature,
} from '../../domain/services/external-services.interface';
import {
  POI_REPOSITORY,
  SEARCH_SESSION_REPOSITORY,
  type IPOIRepository,
  type ISearchSessionRepository,
} from '../../domain/repositories';
import type { NeighborhoodEntity } from '../../domain/entities/neighborhood.entity';
import type { POIEntity, POICategory } from '../../domain/entities/poi.entity';

export interface AnalyzeLocationInput {
  longitude: number;
  latitude: number;
  timeMinutes: number;
  mode: 'driving' | 'walking' | 'cycling';
  /** If provided the session is persisted so the user can reload it later */
  userId?: string;
}

export interface AnalyzeLocationOutput {
  neighborhoods: Array<{
    neighborhood: NeighborhoodEntity;
    pois: POIEntity[];
  }>;
}

const POI_CATEGORIES: POICategory[] = [
  'school', 'park', 'shop', 'transit', 'gym',
  'hospital', 'restaurant', 'bar', 'cafe', 'supermarket',
];

@Injectable()
export class AnalyzeLocationUseCase {
  private readonly logger = new Logger(AnalyzeLocationUseCase.name);

  constructor(
    private readonly getIsochroneUseCase: GetIsochroneUseCase,
    private readonly searchNeighborhoodsUseCase: SearchNeighborhoodsUseCase,
    @Inject(MAPBOX_SERVICE)
    private readonly geoService: IMapboxService,
    @Inject(POI_REPOSITORY)
    private readonly poiRepo: IPOIRepository,
    @Inject(SEARCH_SESSION_REPOSITORY)
    private readonly sessionRepo: ISearchSessionRepository,
  ) {}

  async execute(input: AnalyzeLocationInput): Promise<AnalyzeLocationOutput> {
    // Step 1: Get isochrone polygon
    this.logger.log(
      `Step 1: Fetching ${input.timeMinutes}min isochrone for [${input.longitude}, ${input.latitude}]`,
    );
    const { polygon } = await this.getIsochroneUseCase.execute(input);

    // Step 2: Search neighborhoods within polygon
    this.logger.log('Step 2: Searching neighborhoods within isochrone');
    const { neighborhoods } = await this.searchNeighborhoodsUseCase.execute({ polygon });

    if (neighborhoods.length === 0) {
      this.logger.warn('No neighborhoods found');
      return { neighborhoods: [] };
    }

    this.logger.log(`Found ${neighborhoods.length} neighborhoods`);

    // Step 3: ONE Overpass call for all POIs in the whole isochrone area
    // Avoids N parallel requests that trigger rate-limiting (HTTP 429)
    this.logger.log('Step 3: Fetching all POIs in isochrone area (single Overpass call)');
    let allPOIs: POIFeature[] = [];
    try {
      allPOIs = await this.geoService.searchPOIsForArea({
        polygon,
        categories: POI_CATEGORIES,
      });
      this.logger.log(`Overpass returned ${allPOIs.length} POIs total`);
    } catch (err: any) {
      this.logger.warn(`POI fetch failed (${err?.message}), continuing with empty POI list`);
    }

    // Step 4: Distribute POIs to nearest neighbourhood + persist
    this.logger.log('Step 4: Assigning POIs to neighbourhoods and saving to DB');
    const centroids = neighborhoods.map((n) => ({
      neighborhood: n,
      ...this.calculateCentroid(n.boundary),
    }));

    const poiByNeighborhood = new Map<string, POIFeature[]>(
      neighborhoods.map((n) => [n.id, []]),
    );

    for (const poi of allPOIs) {
      const nearest = this.findNearestNeighborhood(poi.longitude, poi.latitude, centroids);
      if (nearest) {
        poiByNeighborhood.get(nearest.neighborhood.id)!.push(poi);
      }
    }

    const results = await Promise.all(
      neighborhoods.map(async (neighborhood) => {
        const features = poiByNeighborhood.get(neighborhood.id) ?? [];

        if (features.length === 0) {
          const cached = await this.poiRepo.findByNeighborhood(neighborhood.id);
          return { neighborhood, pois: cached };
        }

        // Delete stale cache before inserting fresh data
        await this.poiRepo.deleteByNeighborhood(neighborhood.id);

        const saved = await this.poiRepo.createMany(
          features.map((f) => ({
            neighborhoodId: neighborhood.id,
            category: f.category,
            name: f.name,
            latitude: f.latitude,
            longitude: f.longitude,
            metadata: f.properties,
            mapboxId: f.id,
          })),
        );

        return { neighborhood, pois: saved };
      }),
    );

    this.logger.log(
      `Analysis complete. ${results.length} neighbourhoods, ` +
        `${results.reduce((s, r) => s + r.pois.length, 0)} total POIs`,
    );

    // Persist session for authenticated users so they can reload results later
    if (input.userId) {
      const neighborhoodIds = results.map((r) => r.neighborhood.id);
      this.sessionRepo.save({
        userId: input.userId,
        longitude: input.longitude,
        latitude: input.latitude,
        timeMinutes: input.timeMinutes,
        mode: input.mode,
        neighborhoodIds,
      }).catch((err) =>
        this.logger.warn(`Failed to save search session: ${err?.message}`),
      );
    }

    return { neighborhoods: results };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private calculateCentroid(polygon: GeoJSON.Polygon): { lat: number; lng: number } {
    const coords = polygon.coordinates[0];
    let sumLat = 0, sumLng = 0;
    for (const [lng, lat] of coords) {
      sumLat += lat;
      sumLng += lng;
    }
    return { lat: sumLat / coords.length, lng: sumLng / coords.length };
  }

  /**
   * Returns the neighbourhood whose centroid is closest to (lng, lat),
   * provided the distance is within MAX_RADIUS_DEG (~3 km).
   */
  private findNearestNeighborhood(
    lng: number,
    lat: number,
    centroids: Array<{ neighborhood: NeighborhoodEntity; lat: number; lng: number }>,
  ): { neighborhood: NeighborhoodEntity } | null {
    const MAX_RADIUS_DEG = 0.05; // ~5.5 km — keeps POIs within their area
    let best: { neighborhood: NeighborhoodEntity } | null = null;
    let bestDist = Infinity;

    for (const c of centroids) {
      const dist = Math.hypot(lng - c.lng, lat - c.lat);
      if (dist < bestDist && dist <= MAX_RADIUS_DEG) {
        bestDist = dist;
        best = c;
      }
    }

    return best;
  }
}
