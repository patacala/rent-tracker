import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  SEARCH_SESSION_REPOSITORY,
  NEIGHBORHOOD_REPOSITORY,
  POI_REPOSITORY,
  type ISearchSessionRepository,
  type INeighborhoodRepository,
  type IPOIRepository,
} from '../../domain/repositories';
import type { NeighborhoodEntity } from '../../domain/entities/neighborhood.entity';
import type { POIEntity } from '../../domain/entities/poi.entity';

export interface GetMyAnalysisOutput {
  neighborhoods: Array<{
    neighborhood: NeighborhoodEntity;
    pois: POIEntity[];
  }>;
  analyzedAt: Date | null;
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
  ) {}

  async execute(userId: string): Promise<GetMyAnalysisOutput> {
    const session = await this.sessionRepo.findLatestByUserId(userId);

    if (!session || session.neighborhoodIds.length === 0) {
      this.logger.log(`No saved session for user ${userId}`);
      return { neighborhoods: [], analyzedAt: null };
    }

    this.logger.log(
      `Restoring ${session.neighborhoodIds.length} neighborhoods for user ${userId}`,
    );

    const entries = await Promise.all(
      session.neighborhoodIds.map(async (id) => {
        const neighborhood = await this.neighborhoodRepo.findById(id);
        if (!neighborhood) return null;
        const pois = await this.poiRepo.findByNeighborhood(id);
        return { neighborhood, pois };
      }),
    );

    return {
      neighborhoods: entries.filter(
        (e): e is { neighborhood: NeighborhoodEntity; pois: POIEntity[] } => e !== null,
      ),
      analyzedAt: session.createdAt,
    };
  }
}
