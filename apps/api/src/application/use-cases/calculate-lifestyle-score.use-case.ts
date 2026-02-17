import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import {
  IUserRepository,
  IUserPreferencesRepository,
  ISearchSessionRepository,
  USER_REPOSITORY,
  USER_PREFERENCES_REPOSITORY,
  SEARCH_SESSION_REPOSITORY,
} from '@domain/repositories';
import type { SearchSessionEntity } from '@domain/entities/search-session.entity';
import type { NeighborhoodScore, ScoreBreakdown } from '@rent-tracker/types';
import { buildLifestyleScore } from '@rent-tracker/utils';
import { MIAMI_CONFIG, SCORE_WEIGHTS } from '@rent-tracker/config';

export interface CalculateLifestyleScoreInput {
  userId: string;
  city?: string;
}

export interface CalculateLifestyleScoreOutput {
  session: SearchSessionEntity;
}

@Injectable()
export class CalculateLifestyleScoreUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(USER_PREFERENCES_REPOSITORY)
    private readonly preferencesRepository: IUserPreferencesRepository,
    @Inject(SEARCH_SESSION_REPOSITORY)
    private readonly sessionRepository: ISearchSessionRepository,
  ) {}

  async execute(input: CalculateLifestyleScoreInput): Promise<CalculateLifestyleScoreOutput> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) throw new NotFoundException(`User ${input.userId} not found`);

    const preferences = await this.preferencesRepository.findByUserId(input.userId);
    if (!preferences) {
      throw new BadRequestException(`User ${input.userId} has no preferences set`);
    }

    const city = input.city ?? MIAMI_CONFIG.center.lat.toString();
    const neighborhoods = MIAMI_CONFIG.neighborhoods;

    const results: NeighborhoodScore[] = neighborhoods.map((neighborhood) => {
      const breakdown = this.computeBreakdown(preferences, neighborhood);
      const score = buildLifestyleScore(breakdown);

      return {
        neighborhoodId: neighborhood.id,
        name: neighborhood.name,
        lat: neighborhood.lat,
        lng: neighborhood.lng,
        score,
        city: 'miami',
      };
    });

    const session = await this.sessionRepository.create({
      userId: input.userId,
      city,
      preferencesSnapshot: preferences,
      results,
    });

    return { session };
  }

  // ─── Score Formula ──────────────────────────
  // All weights defined in SCORE_WEIGHTS constant
  private computeBreakdown(
    preferences: {
      workLat: number;
      workLng: number;
      maxCommuteMinutes: number;
      amenities: string[];
      hasFamily: boolean;
    },
    neighborhood: { lat: number; lng: number },
  ): ScoreBreakdown {
    // COMMUTE SCORE (40%)
    // Mock: inverse distance from work location
    const distanceDeg = Math.sqrt(
      Math.pow(preferences.workLat - neighborhood.lat, 2) +
        Math.pow(preferences.workLng - neighborhood.lng, 2),
    );
    const maxDist = 0.3; // ~33km diagonal cap
    const commuteRaw = Math.max(0, 1 - distanceDeg / maxDist);
    const commute = Math.round(commuteRaw * 100);

    // AMENITIES SCORE (40%)
    // Mock: based on amenity count (more requested = higher expectation, random density)
    const amenityCount = preferences.amenities.length;
    const mockDensityFactor = 0.5 + Math.random() * 0.5; // Replace with real data
    const amenities = Math.round(Math.min(100, (amenityCount / 5) * mockDensityFactor * 100));

    // FAMILY SCORE (20%)
    // Mock: random bonus if hasFamily, calibrated per neighborhood
    const familyBase = preferences.hasFamily ? 70 + Math.random() * 30 : 50 + Math.random() * 50;
    const family = Math.round(Math.min(100, familyBase * SCORE_WEIGHTS.family * 5));

    return { commute, amenities, family };
  }
}
