import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  SEARCH_SESSION_REPOSITORY,
  NEIGHBORHOOD_REPOSITORY,
  POI_REPOSITORY,
  FAVORITE_NEIGHBORHOOD_REPOSITORY,
  type ISearchSessionRepository,
  type INeighborhoodRepository,
  type IPOIRepository,
  type IFavoriteNeighborhoodRepository,
} from '../../domain/repositories';
import type { NeighborhoodEntity } from '../../domain/entities/neighborhood.entity';
import type { POIEntity } from '../../domain/entities/poi.entity';

export interface NeighborhoodResult {
  neighborhood: NeighborhoodEntity;
  pois: POIEntity[];
  isFavorite: boolean;
}

export interface GetMyAnalysisOutput {
  neighborhoods: NeighborhoodResult[];
  analyzedAt: Date | null;
  searchParams: {
    longitude: number;
    latitude: number;
    timeMinutes: number;
    mode: string;
  } | null;
}

@Injectable()
export class GetMyAnalysisUseCase {
  private readonly logger = new Logger(GetMyAnalysisUseCase.name);

  constructor(
    @Inject(SEARCH_SESSION_REPOSITORY)
    private readonly sessionRepo: ISearchSessionRepository,
    @Inject(NEIGHBORHOOD_REPOSITORY)
    private readonly neighborhoodRepo: INeighborhoodRepository,
    @Inject(POI_REPOSITORY)
    private readonly poiRepo: IPOIRepository,
    @Inject(FAVORITE_NEIGHBORHOOD_REPOSITORY)
    private readonly favoriteRepo: IFavoriteNeighborhoodRepository,
  ) {}

  async execute(userId: string): Promise<GetMyAnalysisOutput> {
    const session = await this.sessionRepo.findLatestByUserId(userId);

    if (!session || session.neighborhoodIds.length === 0) {
      this.logger.log(`No saved session for user ${userId}`);
      return { neighborhoods: [], analyzedAt: null, searchParams: null };
    }

    const favorites = await this.favoriteRepo.findByUserId(userId);
    const favoriteIds = new Set(favorites.map((f) => f.neighborhoodId));

    this.logger.log(
      `Restoring ${session.neighborhoodIds.length} neighborhoods for user ${userId}`,
    );

    const entries = await Promise.all(
      session.neighborhoodIds.map(async (id) => {
        const neighborhood = await this.neighborhoodRepo.findById(id);
        if (!neighborhood) return null;
        const pois = await this.poiRepo.findByNeighborhood(id);
        return { neighborhood, pois, isFavorite: favoriteIds.has(id) };
      }),
    );

    return {
      neighborhoods: entries.filter((e): e is NeighborhoodResult => e !== null),
      analyzedAt: session.createdAt,
      searchParams: {
        longitude: session.longitude,
        latitude: session.latitude,
        timeMinutes: session.timeMinutes,
        mode: session.mode,
      },
    };
  }
}