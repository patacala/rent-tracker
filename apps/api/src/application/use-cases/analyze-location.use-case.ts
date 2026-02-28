import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeoJSON } from 'geojson';
import { GetIsochroneUseCase } from './get-isochrone.use-case';
import { SearchNeighborhoodsUseCase } from './search-neighborhoods.use-case';
import {
  MAPBOX_SERVICE,
  type IMapboxService,
  type POIFeature,
} from '../../domain/services/external-services.interface';
import {
  NEIGHBORHOOD_REPOSITORY,
  POI_REPOSITORY,
  SEARCH_SESSION_REPOSITORY,
  type INeighborhoodRepository,
  type IPOIRepository,
  type ISearchSessionRepository,
} from '../../domain/repositories';
import type { NeighborhoodEntity } from '../../domain/entities/neighborhood.entity';
import type { POIEntity, POICategory } from '../../domain/entities/poi.entity';
import { GoogleStreetViewService } from '../../infrastructure/external/google/google-street-view.service';

export interface AnalyzeLocationInput {
  longitude: number;
  latitude: number;
  timeMinutes: number;
  mode: 'driving' | 'walking' | 'cycling';
  /** If provided the session is persisted so the user can reload it later */
  userId?: string;
}

export interface AnalysisResult {
  neighborhood: NeighborhoodEntity;
  pois: POIEntity[];
}

export interface AnalyzeLocationOutput {
  neighborhoods: AnalysisResult[];
  /** The isochrone polygon used to define the reachable area — for map rendering */
  isochrone: GeoJSON.Polygon;
}

const POI_CATEGORIES: POICategory[] = [
  'school', 'park', 'shop', 'transit', 'gym',
  'hospital', 'restaurant', 'bar', 'cafe', 'supermarket',
];

/** Max concurrent Google Street View calls to respect API rate limits */
const PHOTO_BATCH_SIZE = 5;

@Injectable()
export class AnalyzeLocationUseCase {
  private readonly logger = new Logger(AnalyzeLocationUseCase.name);

  constructor(
    private readonly getIsochroneUseCase: GetIsochroneUseCase,
    private readonly searchNeighborhoodsUseCase: SearchNeighborhoodsUseCase,
    private readonly streetViewService: GoogleStreetViewService,
    private readonly configService: ConfigService,
    @Inject(MAPBOX_SERVICE)
    private readonly geoService: IMapboxService,
    @Inject(POI_REPOSITORY)
    private readonly poiRepo: IPOIRepository,
    @Inject(SEARCH_SESSION_REPOSITORY)
    private readonly sessionRepo: ISearchSessionRepository,
    @Inject(NEIGHBORHOOD_REPOSITORY)
    private readonly neighborhoodRepo: INeighborhoodRepository,
  ) {}

  async execute(input: AnalyzeLocationInput): Promise<AnalyzeLocationOutput> {
    // Límite solo para usuarios no logueados (free tier). Con userId no se aplica límite.
    const freeTierLimit = this.configService.get<number>('FREE_TIER_NEIGHBORHOOD_LIMIT', 10);
    const limit = input.userId ? undefined : freeTierLimit;

    const polygon       = await this.fetchIsochrone(input);
    const neighborhoods = await this.fetchNeighborhoods(polygon, limit);

    if (neighborhoods.length === 0) {
      this.logger.warn('No neighborhoods found — returning empty result');
      return { neighborhoods: [], isochrone: polygon };
    }

    // Carga sesión anterior si hay usuario logueado
    const previousSession = input.userId
      ? await this.sessionRepo.findLatestByUserId(input.userId)
      : null;

    const previousNeighborhoodIds = previousSession?.neighborhoodIds ?? [];

    const results = await this.fetchAndDistributePOIs(polygon, neighborhoods, previousNeighborhoodIds);
    await this.fetchNeighborhoodPhotos(results);
    this.persistSession(input, results); // fire-and-forget

    return { neighborhoods: results, isochrone: polygon };
  }

  // ─── Step 1 ───────────────────────────────────────────────────────────────

  private async fetchIsochrone(input: AnalyzeLocationInput): Promise<GeoJSON.Polygon> {
    this.logger.log(
      `Step 1: Fetching ${input.timeMinutes}min isochrone for [${input.longitude}, ${input.latitude}]`,
    );
    const { polygon } = await this.getIsochroneUseCase.execute(input);
    return polygon;
  }

  // ─── Step 2 ───────────────────────────────────────────────────────────────

  private async fetchNeighborhoods(polygon: GeoJSON.Polygon, limit?: number): Promise<NeighborhoodEntity[]> {
    this.logger.log(
      `Step 2: Searching neighborhoods within isochrone${limit ? ` (free tier, limit=${limit})` : ''}`,
    );
    const { neighborhoods } = await this.searchNeighborhoodsUseCase.execute({ polygon, limit });
    this.logger.log(`Found ${neighborhoods.length} neighborhoods`);
    return neighborhoods;
  }

  // ─── Step 3 ───────────────────────────────────────────────────────────────

  private async fetchAndDistributePOIs(
    polygon: GeoJSON.Polygon,
    neighborhoods: NeighborhoodEntity[],
    previousNeighborhoodIds: string[],
  ): Promise<AnalysisResult[]> {
    this.logger.log('Step 3: Fetching all POIs in isochrone area (single Overpass call)');

    // Carga barrios de sesión anterior
    const previousResults: AnalysisResult[] = [];
    if (previousNeighborhoodIds.length > 0) {
      const previousEntries = await Promise.all(
        previousNeighborhoodIds.map(async (id) => {
          const neighborhood = await this.neighborhoodRepo.findById(id);
          if (!neighborhood) return null;

          const pois = await this.poiRepo.findByNeighborhood(id);
          return { neighborhood, pois};
        }),
      );
      previousResults.push(
        ...previousEntries.filter((e): e is AnalysisResult => e !== null),
      );
      this.logger.log(`Loaded ${previousResults.length} neighborhoods from previous session with ${previousResults.reduce((s, r) => s + r.pois.length, 0)} POIs`);
    }

    // Set de claves estables de sesión anterior
    const previousKeys = new Set(
      previousResults.map((r) =>
        `${r.neighborhood.name}|${r.neighborhood.centerLat.toFixed(4)}|${r.neighborhood.centerLng.toFixed(4)}`
      ),
    );

    // Filtra barrios nuevos — los que no estaban en la sesión anterior por nombre+coords
    const seenKeys = new Set(previousKeys);
    const newNeighborhoods = neighborhoods.filter((n) => {
      const key = `${n.name}|${n.centerLat.toFixed(4)}|${n.centerLng.toFixed(4)}`;
      if (seenKeys.has(key)) {
        this.logger.log(`Skip duplicate (previous session): ${n.name}`);
        return false;
      }
      seenKeys.add(key);
      return true;
    });

    this.logger.log(
      `${previousResults.length} from previous session, ${newNeighborhoods.length} new neighborhoods`,
    );

    if (newNeighborhoods.length === 0) {
      return previousResults;
    }

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

    const centroids = newNeighborhoods.map((n) => ({
      neighborhood: n,
      ...this.calculateCentroid(n.boundary),
    }));

    const poiByNeighborhood = new Map<string, POIFeature[]>(
      newNeighborhoods.map((n) => [n.id, []]),
    );

    for (const poi of allPOIs) {
      const nearest = this.findNearestNeighborhood(poi.longitude, poi.latitude, centroids);
      if (nearest) {
        poiByNeighborhood.get(nearest.neighborhood.id)!.push(poi);
      }
    }

    const newResults = await Promise.all(
      newNeighborhoods.map(async (neighborhood) => {
        const features = poiByNeighborhood.get(neighborhood.id) ?? [];

        if (features.length === 0) {
          const cached = await this.poiRepo.findByNeighborhood(neighborhood.id);
          return { neighborhood, pois: cached };
        }

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

    // Anteriores primero + nuevos al final
    const allResults = [...previousResults, ...newResults];

    this.logger.log(
      `Step 3 complete. ${allResults.length} neighbourhoods total, ` +
        `${allResults.reduce((s, r) => s + r.pois.length, 0)} total POIs`,
    );

    return allResults;
  }

  // ─── Step 4 ───────────────────────────────────────────────────────────────

  private async fetchNeighborhoodPhotos(results: AnalysisResult[]): Promise<void> {
    const withoutPhoto = results.filter((r) => !r.neighborhood.photoUrl);

    if (withoutPhoto.length === 0) {
      this.logger.log('Step 4: All neighborhoods already have photos cached — skipping Google API');
      return;
    }

    this.logger.log(
      `Step 4: Fetching Street View photos for ${withoutPhoto.length} new neighborhoods ` +
        `(${results.length - withoutPhoto.length} already cached)`,
    );

    for (let i = 0; i < withoutPhoto.length; i += PHOTO_BATCH_SIZE) {
      const batch = withoutPhoto.slice(i, i + PHOTO_BATCH_SIZE);

      await Promise.all(
        batch.map(async (r) => {
          const url = await this.streetViewService.fetchAndPersist(r.neighborhood);
          if (url) {
            // Reflect the new photoUrl in the in-memory result so the API response includes it
            (r.neighborhood as any).photoUrl = url;
          }
        }),
      );
    }

    this.logger.log('Step 4 complete.');
  }

  // ─── Step 5 ───────────────────────────────────────────────────────────────

  private persistSession(input: AnalyzeLocationInput, results: AnalysisResult[]): void {
    if (!input.userId) return;

    const neighborhoodIds = results.map((r) => r.neighborhood.id);
    this.sessionRepo
      .save({
        userId: input.userId,
        longitude: input.longitude,
        latitude: input.latitude,
        timeMinutes: input.timeMinutes,
        mode: input.mode,
        neighborhoodIds,
      })
      .catch((err) =>
        this.logger.warn(`Failed to save search session: ${err?.message}`),
      );
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
   * provided the distance is within MAX_RADIUS_DEG (~5.5 km).
   */
  private findNearestNeighborhood(
    lng: number,
    lat: number,
    centroids: Array<{ neighborhood: NeighborhoodEntity; lat: number; lng: number }>,
  ): { neighborhood: NeighborhoodEntity } | null {
    const MAX_RADIUS_DEG = 0.05;
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