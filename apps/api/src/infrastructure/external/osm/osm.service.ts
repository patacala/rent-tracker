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

/** Raw element shapes returned by the Overpass JSON API */
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
  geometry?: Array<{ lat: number; lon: number }>;
  tags?: Record<string, string>;
}

type OverpassElement = OverpassNode | OverpassWay;

/**
 * OsmService — queries the public Overpass API (OpenStreetMap).
 * Provides searchBoundaries (neighbourhood polygons) and searchPOIs.
 * No API key required; completely free.
 */
@Injectable()
export class OsmService {
  private readonly logger = new Logger(OsmService.name);

  constructor(private readonly httpService: HttpService) {}

  // ─── Boundaries ───────────────────────────────────────────────────────────

  async searchBoundaries(polygon: GeoJSON.Polygon): Promise<BoundaryFeature[]> {
    const [west, south, east, north] = this.calculateBBox(polygon);

    // Overpass bbox format: (south, west, north, east)
    const bboxStr = `(${south},${west},${north},${east})`;

    const query = [
      `[out:json][timeout:${OVERPASS_CONFIG.timeoutSeconds}];`,
      `(`,
      `  node["place"~"neighbourhood|suburb|quarter"]${bboxStr};`,
      `  way["place"~"neighbourhood|suburb|quarter"]${bboxStr};`,
      `);`,
      `out geom;`,
    ].join('\n');

    try {
      this.logger.log(
        `Overpass: searching neighbourhoods in bbox [S:${south.toFixed(4)}, W:${west.toFixed(4)}, N:${north.toFixed(4)}, E:${east.toFixed(4)}]`,
      );

      const response = await firstValueFrom(
        this.httpService.post<{ elements: OverpassElement[] }>(
          OVERPASS_CONFIG.baseUrl,
          `data=${encodeURIComponent(query)}`,
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: OVERPASS_CONFIG.timeoutMs,
          },
        ),
      );

      const elements = response.data.elements ?? [];
      this.logger.log(`Overpass returned ${elements.length} neighbourhood elements`);

      return elements
        .map((el) => this.elementToBoundaryFeature(el))
        .filter((f): f is BoundaryFeature => f !== null);
    } catch (error: any) {
      this.logger.error(
        `Overpass searchBoundaries failed: ${error?.message}`,
        error?.stack,
      );
      throw new HttpException(
        'Failed to fetch neighbourhood boundaries from Overpass',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  // ─── POIs ─────────────────────────────────────────────────────────────────

  async searchPOIs(params: {
    boundary: GeoJSON.Polygon;
    categories: POICategory[];
  }): Promise<POIFeature[]> {
    const [west, south, east, north] = this.calculateBBox(params.boundary);
    const bboxStr = `(${south},${west},${north},${east})`;

    // Collect unique Overpass tag expressions for the requested categories
    const filters = [
      ...new Set(
        params.categories.flatMap((cat) => OVERPASS_CONFIG.categoryFilters[cat] ?? []),
      ),
    ];

    if (filters.length === 0) {
      return [];
    }

    const nodeLines = filters.map((f) => `  node${f}${bboxStr};`).join('\n');
    const query = [
      `[out:json][timeout:${OVERPASS_CONFIG.timeoutSeconds}];`,
      `(`,
      nodeLines,
      `);`,
      `out body;`,
    ].join('\n');

    try {
      this.logger.log(
        `Overpass: searching POIs for [${params.categories.join(', ')}]`,
      );

      const response = await firstValueFrom(
        this.httpService.post<{ elements: OverpassElement[] }>(
          OVERPASS_CONFIG.baseUrl,
          `data=${encodeURIComponent(query)}`,
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: OVERPASS_CONFIG.timeoutMs,
          },
        ),
      );

      const elements = response.data.elements ?? [];
      this.logger.log(`Overpass returned ${elements.length} POI elements`);

      return elements
        .map((el) => this.elementToPOIFeature(el, params.categories))
        .filter((f): f is POIFeature => f !== null);
    } catch (error: any) {
      this.logger.error(`Overpass searchPOIs failed: ${error?.message}`, error?.stack);
      throw new HttpException(
        'Failed to fetch POIs from Overpass',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  // ─── Element converters ───────────────────────────────────────────────────

  private elementToBoundaryFeature(element: OverpassElement): BoundaryFeature | null {
    const tags = element.tags ?? {};
    const name = tags['name'] || tags['name:en'];
    if (!name) return null;

    let boundary: GeoJSON.Polygon;

    if (element.type === 'node') {
      // Nodes are points; approximate with a small circle polygon
      boundary = this.buildPointPolygon(element.lat, element.lon);
    } else if (element.type === 'way' && Array.isArray(element.geometry) && element.geometry.length >= 3) {
      const ring: [number, number][] = element.geometry.map((p) => [p.lon, p.lat]);
      // Ensure the ring is closed
      const first = ring[0];
      const last = ring[ring.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) {
        ring.push([first[0], first[1]]);
      }
      boundary = { type: 'Polygon', coordinates: [ring] };
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
    // Only nodes carry lat/lon directly from Overpass `out body`
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

  // ─── Bulk POI fetch (one query for the entire isochrone) ─────────────────

  /**
   * Fetches all POIs inside the isochrone polygon in a single Overpass request.
   * Use this from AnalyzeLocationUseCase to avoid N parallel per-neighbourhood calls.
   */
  async searchPOIsForArea(params: {
    polygon: GeoJSON.Polygon;
    categories: POICategory[];
  }): Promise<POIFeature[]> {
    return this.searchPOIs({ boundary: params.polygon, categories: params.categories });
  }

  // ─── Category detection ───────────────────────────────────────────────────

  /**
   * Determines which POICategory best matches a set of OSM tags.
   * Checks are ordered: more specific categories (supermarket) before generic ones (shop).
   */
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
      ['school',      () => /school|university|college|kindergarten/.test(amenity)],
      ['park',        () => /park|garden|nature_reserve/.test(leisure)],
      ['supermarket', () => /supermarket|grocery|convenience/.test(shop)],
      ['shop',        () => shop.length > 0],
      ['transit',     () =>
        highway === 'bus_stop' ||
        /station|halt|tram_stop|subway_entrance/.test(railway) ||
        /bus_station|ferry_terminal/.test(amenity)],
      ['gym',         () => /fitness_centre|sports_centre|swimming_pool/.test(leisure) || amenity === 'gym'],
      ['hospital',    () => /hospital|clinic|doctors|dentist|pharmacy/.test(amenity)],
      ['restaurant',  () => amenity === 'restaurant'],
      ['bar',         () => /bar|pub|nightclub|biergarten/.test(amenity)],
      ['cafe',        () => /cafe|fast_food|food_court/.test(amenity)],
    ];

    for (const [cat, test] of checks) {
      if (requested.includes(cat) && test()) return cat;
    }

    return null;
  }

  // ─── Geometry helpers ─────────────────────────────────────────────────────

  /** Returns [minLng, minLat, maxLng, maxLat] from a GeoJSON Polygon */
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

  /** Approximates a point as a small regular polygon (for OSM nodes) */
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
}
