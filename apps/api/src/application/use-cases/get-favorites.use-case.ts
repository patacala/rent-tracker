import { Injectable, Inject } from '@nestjs/common';
import {
  FAVORITE_NEIGHBORHOOD_REPOSITORY,
  NEIGHBORHOOD_REPOSITORY,
  POI_REPOSITORY,
  type IFavoriteNeighborhoodRepository,
  type INeighborhoodRepository,
  type IPOIRepository,
} from '../../domain/repositories';
import type { NeighborhoodEntity } from '../../domain/entities/neighborhood.entity';
import type { POIEntity } from '../../domain/entities/poi.entity';

export interface FavoriteNeighborhoodEntry {
  neighborhood: NeighborhoodEntity;
  pois: POIEntity[];
  isFavorite: true;
}

export interface GetFavoritesOutput {
  neighborhoods: FavoriteNeighborhoodEntry[];
}

@Injectable()
export class GetFavoritesUseCase {
  constructor(
    @Inject(FAVORITE_NEIGHBORHOOD_REPOSITORY)
    private readonly favoriteRepo: IFavoriteNeighborhoodRepository,
    @Inject(NEIGHBORHOOD_REPOSITORY)
    private readonly neighborhoodRepo: INeighborhoodRepository,
    @Inject(POI_REPOSITORY)
    private readonly poiRepo: IPOIRepository,
  ) {}

  async execute(userId: string): Promise<GetFavoritesOutput> {
    const favorites = await this.favoriteRepo.findByUserId(userId);

    const entries = await Promise.all(
      favorites.map(async (f) => {
        const neighborhood = await this.neighborhoodRepo.findById(f.neighborhoodId);
        if (!neighborhood) return null;
        const pois = await this.poiRepo.findByNeighborhood(f.neighborhoodId);
        return { neighborhood, pois, isFavorite: true as const };
      }),
    );

    return {
      neighborhoods: entries.filter((e): e is FavoriteNeighborhoodEntry => e !== null),
    };
  }
}