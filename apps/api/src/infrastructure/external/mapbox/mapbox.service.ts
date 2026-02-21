import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { GeoJSON } from 'geojson';
import { MAPBOX_CONFIG } from './mapbox.config';
import type {
  IMapboxService,
  IsochroneParams,
  IsochroneResult,
  BoundaryFeature,
  POIFeature,
} from '../../../domain/services/external-services.interface';

@Injectable()
export class MapboxService implements IMapboxService {
  private readonly logger = new Logger(MapboxService.name);
  private readonly accessToken: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.accessToken = this.configService.get<string>('MAPBOX_ACCESS_TOKEN', '');

    if (!this.accessToken) {
      this.logger.warn('MAPBOX_ACCESS_TOKEN not configured');
    }
  }

  async getIsochrone(params: IsochroneParams): Promise<IsochroneResult> {
    const endpoint = `${MAPBOX_CONFIG.baseUrl}${MAPBOX_CONFIG.endpoints.isochrone(params.mode)}/${params.longitude},${params.latitude}`;

    const queryParams = new URLSearchParams({
      contours_minutes: params.timeMinutes.toString(),
      polygons: 'true',
      access_token: this.accessToken,
    });

    try {
      this.logger.log(`Fetching isochrone: ${params.timeMinutes}min ${params.mode} from [${params.longitude}, ${params.latitude}]`);

      const response = await firstValueFrom(
        this.httpService.get(`${endpoint}?${queryParams.toString()}`, {
          timeout: MAPBOX_CONFIG.timeoutMs,
        })
      );

      const polygon = response.data.features[0].geometry as GeoJSON.Polygon;

      return {
        polygon,
        timeMinutes: params.timeMinutes,
        mode: params.mode,
      };
    } catch (error) {
      this.handleMapboxError(error, 'Failed to fetch isochrone');
    }
  }

  async searchBoundaries(polygon: GeoJSON.Polygon): Promise<BoundaryFeature[]> {
    // Calculate bounding box from polygon
    const bbox = this.calculateBoundingBox(polygon);

    const endpoint = `${MAPBOX_CONFIG.baseUrl}${MAPBOX_CONFIG.endpoints.tilequery(MAPBOX_CONFIG.tilesets.boundaries)}/${bbox.join(',')}.json`;

    const queryParams = new URLSearchParams({
      access_token: this.accessToken,
      limit: '50',
      layers: 'boundaries_admin_3,boundaries_locality', // Neighborhood-level boundaries
    });

    try {
      this.logger.log(`Searching boundaries within polygon`);

      const response = await firstValueFrom(
        this.httpService.get(`${endpoint}?${queryParams.toString()}`, {
          timeout: MAPBOX_CONFIG.timeoutMs,
        })
      );

      return response.data.features.map((feature: any) => ({
        id: feature.id,
        name: feature.properties.name || feature.properties.name_en,
        boundary: feature.geometry,
        properties: feature.properties,
      }));
    } catch (error) {
      this.handleMapboxError(error, 'Failed to search boundaries');
    }
  }

  async searchPOIs(params: {
    boundary: GeoJSON.Polygon;
    categories: string[];
  }): Promise<POIFeature[]> {
    const bbox = this.calculateBoundingBox(params.boundary);

    const endpoint = `${MAPBOX_CONFIG.baseUrl}${MAPBOX_CONFIG.endpoints.tilequery(MAPBOX_CONFIG.tilesets.poi)}/${bbox.join(',')}.json`;

    const queryParams = new URLSearchParams({
      access_token: this.accessToken,
      limit: '50',
      layers: 'poi_label', // POI layer in Mapbox Streets
    });

    try {
      this.logger.log(`Searching POIs for categories: ${params.categories.join(', ')}`);

      const response = await firstValueFrom(
        this.httpService.get(`${endpoint}?${queryParams.toString()}`, {
          timeout: MAPBOX_CONFIG.timeoutMs,
        })
      );

      return response.data.features
        .filter((feature: any) => {
          const mapboxType = feature.properties.type;
          const category = MAPBOX_CONFIG.categoryMapping[mapboxType as keyof typeof MAPBOX_CONFIG.categoryMapping];

          // Filter: must match category and not be excluded
          return (
            category &&
            params.categories.includes(category) &&
            !MAPBOX_CONFIG.excludeTypes.includes(mapboxType)
          );
        })
        .map((feature: any) => ({
          id: feature.id,
          name: feature.properties.name,
          category: MAPBOX_CONFIG.categoryMapping[feature.properties.type as keyof typeof MAPBOX_CONFIG.categoryMapping],
          latitude: feature.geometry.coordinates[1],
          longitude: feature.geometry.coordinates[0],
          properties: feature.properties,
        }));
    } catch (error) {
      this.handleMapboxError(error, 'Failed to search POIs');
    }
  }

  async searchPOIsForArea(params: {
    polygon: GeoJSON.Polygon;
    categories: POIFeature['category'][];
  }): Promise<POIFeature[]> {
    return this.searchPOIs({ boundary: params.polygon, categories: params.categories });
  }

  private calculateBoundingBox(polygon: GeoJSON.Polygon): [number, number, number, number] {
    const coordinates = polygon.coordinates[0]; // Outer ring

    let minLng = Infinity, minLat = Infinity;
    let maxLng = -Infinity, maxLat = -Infinity;

    for (const [lng, lat] of coordinates) {
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }

    return [minLng, minLat, maxLng, maxLat];
  }

  private handleMapboxError(error: any, message: string): never {
    if (error.response?.status === 429) {
      this.logger.error('Mapbox API rate limit exceeded');
      throw new HttpException(
        'Mapbox API rate limit exceeded. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    if (error.response?.status === 401) {
      this.logger.error('Invalid Mapbox access token');
      throw new HttpException(
        'Mapbox authentication failed. Check API token.',
        HttpStatus.UNAUTHORIZED
      );
    }

    this.logger.error(`${message}: ${error.message}`, error.stack);
    throw new HttpException(
      message,
      HttpStatus.SERVICE_UNAVAILABLE
    );
  }
}
