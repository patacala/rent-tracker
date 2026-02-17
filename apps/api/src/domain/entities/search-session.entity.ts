import type { NeighborhoodScore } from '@rent-tracker/types';
import type { UserPreferencesEntity } from './user-preferences.entity';

// ─── Domain Entity: SearchSession ────────────

export class SearchSessionEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly city: string,
    public readonly preferencesSnapshot: UserPreferencesEntity,
    public readonly results: NeighborhoodScore[],
    public readonly createdAt: Date,
  ) {}

  static create(params: {
    id: string;
    userId: string;
    city: string;
    preferencesSnapshot: UserPreferencesEntity;
    results: NeighborhoodScore[];
    createdAt: Date;
  }): SearchSessionEntity {
    return new SearchSessionEntity(
      params.id,
      params.userId,
      params.city,
      params.preferencesSnapshot,
      params.results,
      params.createdAt,
    );
  }

  topNeighborhood(): NeighborhoodScore | undefined {
    return this.results.reduce<NeighborhoodScore | undefined>((best, current) => {
      if (!best || current.score.overall > best.score.overall) return current;
      return best;
    }, undefined);
  }
}
