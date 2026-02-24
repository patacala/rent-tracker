import { Injectable, Inject } from '@nestjs/common';
import {
  FAVORITE_NEIGHBORHOOD_REPOSITORY,
  type IFavoriteNeighborhoodRepository,
} from '../../domain/repositories';

export interface ToggleFavoriteInput {
  userId: string;
  neighborhoodId: string;
}

export interface ToggleFavoriteOutput {
  isFavorite: boolean;
}

@Injectable()
export class ToggleFavoriteUseCase {
  constructor(
    @Inject(FAVORITE_NEIGHBORHOOD_REPOSITORY)
    private readonly favoriteRepo: IFavoriteNeighborhoodRepository,
  ) {}

  async execute(input: ToggleFavoriteInput): Promise<ToggleFavoriteOutput> {
    const already = await this.favoriteRepo.isFavorite(input);

    if (already) {
      await this.favoriteRepo.delete(input);
      return { isFavorite: false };
    }

    await this.favoriteRepo.save(input);
    return { isFavorite: true };
  }
}