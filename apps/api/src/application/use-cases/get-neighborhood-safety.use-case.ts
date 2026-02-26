import { Injectable, Inject, Logger } from '@nestjs/common';
import type { NeighborhoodSafetyEntity } from '../../domain/entities/neighborhood-safety.entity';
import { DoorProfitService } from '@infrastructure/external/doorprofit/doorprofit.service';
import { INeighborhoodSafetyRepository, NEIGHBORHOOD_SAFETY_REPOSITORY } from '@domain/repositories';

export interface GetNeighborhoodSafetyInput {
  neighborhoodName: string;
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
    const { neighborhoodName, lat, lng } = input;

    // 1. Busca en DB por nombre
    const cached = await this.safetyRepo.findByName(neighborhoodName);

    if (cached && !this.safetyRepo.isExpired(cached.cachedAt)) {
      this.logger.log(`Cache hit for neighborhood "${neighborhoodName}"`);
      return cached;
    }

    this.logger.log(`Cache miss for "${neighborhoodName}" — fetching from DoorProfit`);

    const crimeData = await this.doorProfitService.getCrimeByCoordinates(lat, lng);

    const saved = await this.safetyRepo.upsert({
      neighborhoodName,
      ...crimeData,
      cachedAt: new Date(),
    });

    this.logger.log(`Saved safety data for "${neighborhoodName}"`);
    return saved;
  }
}