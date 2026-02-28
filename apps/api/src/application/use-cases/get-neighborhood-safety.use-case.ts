import { Injectable, Inject, Logger } from '@nestjs/common';
import type { NeighborhoodSafetyEntity } from '../../domain/entities/neighborhood-safety.entity';
import { DoorProfitService } from '@infrastructure/external/doorprofit/doorprofit.service';
import { INeighborhoodSafetyRepository, NEIGHBORHOOD_SAFETY_REPOSITORY } from '@domain/repositories';

export interface GetNeighborhoodSafetyInput {
  neighborhoodId: string;
  lat: number;
  lng: number;
}

@Injectable()
export class GetNeighborhoodSafetyUseCase {
  private readonly logger = new Logger(GetNeighborhoodSafetyUseCase.name);

  constructor(
    @Inject(NEIGHBORHOOD_SAFETY_REPOSITORY)
    private readonly safetyRepo: INeighborhoodSafetyRepository,
    private readonly doorProfitService: DoorProfitService,
  ) {}

  async execute(input: GetNeighborhoodSafetyInput): Promise<NeighborhoodSafetyEntity> {
    const { neighborhoodId, lat, lng } = input;

    const cached = await this.safetyRepo.findByNeighborhoodId(neighborhoodId);

    if (cached && !this.safetyRepo.isExpired(cached.cachedAt)) {
      this.logger.log(`Cache hit for neighborhood "${neighborhoodId}"`);
      return cached;
    }

    this.logger.log(`Cache miss for "${neighborhoodId}" — fetching from DoorProfit`);

    try {
      const crimeData = await this.doorProfitService.getCrimeByCoordinates(lat, lng);

      const saved = await this.safetyRepo.upsert({
        neighborhoodId,
        ...crimeData,
        cachedAt: new Date(),
      });

      this.logger.log(`Saved safety data for neighborhood "${neighborhoodId}"`);
      return saved;

    } catch (err: any) {
      const is429 = err?.message?.includes('429');

      if (is429) {
        this.logger.warn(`DoorProfit rate limit hit for "${neighborhoodId}" — returning stale cache or null`);
      } else {
        this.logger.error(`DoorProfit error for "${neighborhoodId}": ${err?.message}`);
      }

      if (cached) {
        this.logger.log(`Returning stale cache for "${neighborhoodId}"`);
        return cached;
      }

      throw err;
    }
  }
}