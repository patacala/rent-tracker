import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { GeoJSON } from 'geojson';
import { OVERPASS_CONFIG } from './overpass.config';
import type {
  BoundaryFeature,
  POIFeature,
} from '../../../domain/services/external-services.interface';
import type { POICategory } from '../../../domain/entities/poi.entity';

interface OverpassNode {
  type: 'node';
  id: number;
  lat: number;
  lon: number;
  tags?: Record<string, string>;
}

interface OverpassWay {
  type: 'way';
  id: number;
  center?: { lat: number; lon: number };
  geometry?: Array<{ lat: number; lon: number }>;
  tags?: Record<string, string>;
}

type OverpassElement = OverpassNode | OverpassWay;

/**
 * OsmService — queries the public Overpass API (OpenStreetMap).
 *
 * Key optimisations over a naive implementation:
 * 1. Global [bbox] setting — avoids repeating coordinates on every filter line.
 * 2. [maxsize] setting — prevents mid-stream aborts on large result sets.
 * 3. `out center` for boundaries — returns only the centroid of each Way,
 *    avoiding multi-KB geometry payloads we don't actually use.
 * 4. `out qt` for POIs — quicksort output, faster server-side serialisation.
 * 5. Mirror rotation + retry — if the primary Overpass server returns 5xx/429,
 *    the request is retried on the next mirror automatically.
 */
@Injectable()
export class OsmService {
  private readonly logger = new Logger(OsmService.name);

  constructor(private readonly httpService: HttpService) {}

  // ─── Boundaries ───────────────────────────────────────────────────────────

  async searchBoundaries(polygon: GeoJSON.Polygon, limit?: number): Promise<BoundaryFeature[]> {
    const [west, south, east, north] = this.calculateBBox(polygon);

    /**
     * Uses `out geom` for Ways to get real polygon boundaries for map rendering.
     * When `limit` is provided (free-tier), we request more candidates from Overpass
     * than we will return, so that after point-in-polygon filtering we still have
     * enough neighborhoods inside the isochrone (cap at 80 to keep payload small).
     */
    const overpassLimit = limit ? Math.min(Math.max(limit * 3, 50), 80) : undefined;
    const outClause = overpassLimit ? `out geom ${overpassLimit};` : `out geom;`;
    // Include place tags (neighbourhood, suburb, quarter) plus administrative
    // boundaries at neighbourhood/district level (admin_level 9–10) so we get
    // more coverage in areas like Orlando where OSM has few place=* but many admin boundaries.
    const query = [
      `[out:json]`,
      `[timeout:${OVERPASS_CONFIG.timeoutSeconds}]`,
      `[maxsize:${OVERPASS_CONFIG.maxsizeBytes}]`,
      `[bbox:${south},${west},${north},${east}];`,
      `(`,
      `  node["place"~"^(neighbourhood|suburb|quarter)$"];`,
      `  way["place"~"^(neighbourhood|suburb|quarter)$"];`,
      `  way["boundary"="administrative"]["admin_level"~"^(9|10)$"];`,
      `);`,
      outClause,
    ].join('\n');

    this.logger.log(
      `Overpass boundaries: bbox [S:${south.toFixed(4)}, W:${west.toFixed(4)}, N:${north.toFixed(4)}, E:${east.toFixed(4)}]`,
    );

    const elements = await this.queryWithRetry<OverpassElement>(query, 'searchBoundaries');

    this.logger.log(`Overpass returned ${elements.length} neighbourhood elements`);

    return elements
      .map((el) => this.elementToBoundaryFeature(el))
      .filter((f): f is BoundaryFeature => f !== null);
  }

  // ─── POIs ─────────────────────────────────────────────────────────────────

  async searchPOIs(params: {
    boundary: GeoJSON.Polygon;
    categories: POICategory[];
  }): Promise<POIFeature[]> {
    const [west, south, east, north] = this.calculateBBox(params.boundary);

    const filters = [
      ...new Set(
        params.categories.flatMap((cat) => OVERPASS_CONFIG.categoryFilters[cat] ?? []),
      ),
    ];

    if (filters.length === 0) return [];

    /**
     * Optimisations:
     * - [bbox:...] global setting removes N repetitions of the bbox string.
     * - `out qt` (quicksort) is faster server-side than the default `out`.
     * - Anchored regexes (^...$) in categoryFilters prevent partial matches,
     *   reducing false positives and result set size.
     */
    const nodeLines = filters.map((f) => `  node${f};`).join('\n');
    const query = [
      `[out:json]`,
      `[timeout:${OVERPASS_CONFIG.timeoutSeconds}]`,
      `[maxsize:${OVERPASS_CONFIG.maxsizeBytes}]`,
      `[bbox:${south},${west},${north},${east}];`,
      `(`,
      nodeLines,
      `);`,
      `out qt;`,
    ].join('\n');

    this.logger.log(
      `Overpass POIs: [${params.categories.join(', ')}] in bbox [S:${south.toFixed(4)}, W:${west.toFixed(4)}, N:${north.toFixed(4)}, E:${east.toFixed(4)}]`,
    );

    const elements = await this.queryWithRetry<OverpassElement>(query, 'searchPOIs');

    this.logger.log(`Overpass returned ${elements.length} POI elements`);

    return elements
      .map((el) => this.elementToPOIFeature(el, params.categories))
      .filter((f): f is POIFeature => f !== null);
  }

  async searchPOIsForArea(params: {
    polygon: GeoJSON.Polygon;
    categories: POICategory[];
  }): Promise<POIFeature[]> {
    return this.searchPOIs({ boundary: params.polygon, categories: params.categories });
  }

  // ─── Mirror rotation + retry ──────────────────────────────────────────────

  /**
   * Sends the Overpass QL query to the first available mirror.
   * On 429 / 5xx it waits briefly and tries the next mirror.
   * Throws only after all mirrors are exhausted.
   */
  private async queryWithRetry<T>(query: string, context: string): Promise<T[]> {
    const mirrors = [...OVERPASS_CONFIG.mirrors];
    let lastError: Error | undefined;

    for (let i = 0; i < mirrors.length; i++) {
      const url = mirrors[i];
      try {
        if (i > 0) {
          const waitMs = i * 2_000;
          this.logger.warn(`${context}: retrying on mirror ${i + 1}/${mirrors.length} (${url}) after ${waitMs}ms`);
          await this.sleep(waitMs);
        }

        const response = await firstValueFrom(
          this.httpService.post<{ elements: T[] }>(
            url,
            `data=${encodeURIComponent(query)}`,
            {
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              timeout: OVERPASS_CONFIG.timeoutMs,
            },
          ),
        );

        return response.data.elements ?? [];
      } catch (error: any) {
        const status: number | undefined = error?.response?.status;
        lastError = error;

        this.logger.error(
          `${context} failed on ${url} [HTTP ${status ?? 'network error'}]: ${error?.message}`,
        );

        // Don't retry on client errors (4xx except 429)
        if (status && status >= 400 && status < 500 && status !== 429) {
          break;
        }
      }
    }

    throw new HttpException(
      `Overpass ${context} failed on all mirrors: ${lastError?.message}`,
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }

  // ─── Element converters ───────────────────────────────────────────────────

  private elementToBoundaryFeature(element: OverpassElement): BoundaryFeature | null {
    const tags = element.tags ?? {};
    const name = tags['name'] || tags['name:en'];
    if (!name) return null;

    let boundary: GeoJSON.Polygon;

    if (element.type === 'node') {
      // OSM nodes are points — approximate with a small circle polygon.
      // centerLat/centerLng will be set to the exact point coordinates.
      boundary = this.buildPointPolygon(element.lat, element.lon);
    } else if (element.type === 'way') {
      if (element.geometry && element.geometry.length >= 3) {
        // Real polygon from `out geom` — used for accurate map rendering.
        // The centroid is computed separately in SearchNeighborhoodsUseCase
        // from this same polygon, so calculations stay accurate.
        const ring: [number, number][] = element.geometry.map((p) => [p.lon, p.lat]);
        const first = ring[0];
        const last  = ring[ring.length - 1];
        if (first[0] !== last[0] || first[1] !== last[1]) {
          ring.push([first[0], first[1]]);
        }
        boundary = { type: 'Polygon', coordinates: [ring] };
      } else if (element.center) {
        // Fallback: server returned center but no geometry (shouldn't happen with out geom)
        boundary = this.buildPointPolygon(element.center.lat, element.center.lon);
      } else {
        return null;
      }
    } else {
      return null;
    }

    return {
      id: `osm_${element.type}_${element.id}`,
      name,
      boundary,
      properties: tags,
    };
  }

  private elementToPOIFeature(
    element: OverpassElement,
    requested: POICategory[],
  ): POIFeature | null {
    if (element.type !== 'node') return null;

    const tags = element.tags ?? {};
    const name = tags['name'];
    if (!name) return null;

    const category = this.detectCategory(tags, requested);
    if (!category) return null;

    return {
      id: `osm_node_${element.id}`,
      name,
      category,
      latitude: element.lat,
      longitude: element.lon,
      properties: tags,
    };
  }

  // ─── Category detection ───────────────────────────────────────────────────

  private detectCategory(
    tags: Record<string, string>,
    requested: POICategory[],
  ): POICategory | null {
    const amenity = tags['amenity'] ?? '';
    const leisure = tags['leisure'] ?? '';
    const shop    = tags['shop']    ?? '';
    const highway = tags['highway'] ?? '';
    const railway = tags['railway'] ?? '';

    const checks: [POICategory, () => boolean][] = [
      ['school',      () => /^(school|university|college|kindergarten)$/.test(amenity)],
      ['park',        () => /^(park|garden|nature_reserve)$/.test(leisure)],
      ['supermarket', () => /^(supermarket|convenience)$/.test(shop)],
      ['shop',        () => shop.length > 0],
      ['transit',     () =>
        highway === 'bus_stop' ||
        /^(station|halt|tram_stop|subway_entrance)$/.test(railway)],
      ['gym',         () => /^(fitness_centre|sports_centre|swimming_pool)$/.test(leisure)],
      ['hospital',    () => /^(hospital|clinic|doctors|dentist|pharmacy)$/.test(amenity)],
      ['restaurant',  () => amenity === 'restaurant'],
      ['bar',         () => /^(bar|pub|nightclub)$/.test(amenity)],
      ['cafe',        () => /^(cafe|fast_food)$/.test(amenity)],
    ];

    for (const [cat, test] of checks) {
      if (requested.includes(cat) && test()) return cat;
    }

    return null;
  }

  // ─── Geometry helpers ─────────────────────────────────────────────────────

  private calculateBBox(polygon: GeoJSON.Polygon): [number, number, number, number] {
    const coords = polygon.coordinates[0];
    let minLng = Infinity, minLat = Infinity;
    let maxLng = -Infinity, maxLat = -Infinity;

    for (const [lng, lat] of coords) {
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }

    return [minLng, minLat, maxLng, maxLat];
  }

  /** Approximates a point as a small regular polygon (used for OSM nodes and way centroids) */
  private buildPointPolygon(lat: number, lng: number, radiusDeg = 0.005): GeoJSON.Polygon {
    const numPoints = 16;
    const coords: [number, number][] = [];
    for (let i = 0; i <= numPoints; i++) {
      const angle = (i / numPoints) * 2 * Math.PI;
      coords.push([
        lng + radiusDeg * Math.cos(angle),
        lat + radiusDeg * Math.sin(angle),
      ]);
    }
    return { type: 'Polygon', coordinates: [coords] };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
