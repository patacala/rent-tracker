import { Injectable, Inject } from '@nestjs/common';
import {
  FAVORITE_NEIGHBORHOOD_REPOSITORY,
  NEIGHBORHOOD_REPOSITORY,
  type IFavoriteNeighborhoodRepository,
  type INeighborhoodRepository,
} from '../../domain/repositories';
import type { NeighborhoodEntity } from '../../domain/entities/neighborhood.entity';

export interface GetFavoritesOutput {
  neighborhoods: NeighborhoodEntity[];
}

@Injectable()
export class GetFavoritesUseCase {
  constructor(
    @Inject(FAVORITE_NEIGHBORHOOD_REPOSITORY)
    private readonly favoriteRepo: IFavoriteNeighborhoodRepository,
    @Inject(NEIGHBORHOOD_REPOSITORY)
    private readonly neighborhoodRepo: INeighborhoodRepository,
  ) {}

  async execute(userId: string): Promise<GetFavoritesOutput> {
    const favorites = await this.favoriteRepo.findByUserId(userId);

    const neighborhoods = await Promise.all(
      favorites.map((f) => this.neighborhoodRepo.findById(f.neighborhoodId)),
    );

    return {
      neighborhoods: neighborhoods.filter((n): n is NeighborhoodEntity => n !== null),
    };
  }
}