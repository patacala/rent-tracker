import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import {
  NEIGHBORHOOD_REPOSITORY,
  POI_REPOSITORY,
  type INeighborhoodRepository,
  type IPOIRepository,
} from '../../domain/repositories';
import {
  MAPBOX_SERVICE,
  type IMapboxService,
} from '../../domain/services/external-services.interface';
import type { POIEntity, POICategory } from '../../domain/entities/poi.entity';

export interface GetNeighborhoodPOIsInput {
  neighborhoodId: string;
}

export interface GetNeighborhoodPOIsOutput {
  pois: POIEntity[];
}

@Injectable()
export class GetNeighborhoodPOIsUseCase {
  private readonly logger = new Logger(GetNeighborhoodPOIsUseCase.name);
  private readonly POI_CATEGORIES: POICategory[] = [
    'school',
    'park',
    'shop',
    'transit',
    'gym',
    'hospital',
    'restaurant',
    'bar',
    'cafe',
    'supermarket',
  ];

  constructor(
    @Inject(NEIGHBORHOOD_REPOSITORY)
    private readonly neighborhoodRepo: INeighborhoodRepository,
    @Inject(POI_REPOSITORY)
    private readonly poiRepo: IPOIRepository,
    @Inject(MAPBOX_SERVICE)
    private readonly mapboxService: IMapboxService,
  ) {}

  async execute(input: GetNeighborhoodPOIsInput): Promise<GetNeighborhoodPOIsOutput> {
    const neighborhood = await this.neighborhoodRepo.findById(input.neighborhoodId);
    if (!neighborhood) {
      throw new NotFoundException(`Neighborhood ${input.neighborhoodId} not found`);
    }

    // Check cache
    this.logger.log(`Checking POI cache for neighborhood ${neighborhood.name}`);
    const cached = await this.poiRepo.findByNeighborhood(input.neighborhoodId);
    const validCached = cached.filter(p => p.isCacheValid(24)); // 24 hours TTL

    if (validCached.length > 0) {
      this.logger.log(`Found ${validCached.length} valid cached POIs`);
      return { pois: validCached };
    }

    // Delete stale cache
    if (cached.length > 0) {
      this.logger.log('Deleting stale POI cache');
      await this.poiRepo.deleteByNeighborhood(input.neighborhoodId);
    }

    // Fetch from Overpass/OSM
    this.logger.log('Cache miss. Fetching POIs from Overpass/OSM API');
    const poiFeatures = await this.mapboxService.searchPOIs({
      boundary: neighborhood.boundary,
      categories: this.POI_CATEGORIES,
    });

    if (poiFeatures.length === 0) {
      this.logger.warn('No POIs found from Mapbox');
      return { pois: [] };
    }

    // Save to DB
    this.logger.log(`Saving ${poiFeatures.length} POIs to DB`);
    const saved = await this.poiRepo.createMany(
      poiFeatures.map(f => ({
        neighborhoodId: input.neighborhoodId,
        category: f.category,
        name: f.name,
        latitude: f.latitude,
        longitude: f.longitude,
        metadata: f.properties,
        mapboxId: f.id,
      })),
    );

    return { pois: saved };
  }
}
