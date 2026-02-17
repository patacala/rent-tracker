import type { AmenityType, CommuteOption } from '@rent-tracker/types';

// ─── Domain Entity: UserPreferences ──────────

export class UserPreferencesEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly workLat: number,
    public readonly workLng: number,
    public readonly maxCommuteMinutes: CommuteOption,
    public readonly amenities: AmenityType[],
    public readonly hasFamily: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(params: {
    id: string;
    userId: string;
    workLat: number;
    workLng: number;
    maxCommuteMinutes: CommuteOption;
    amenities: AmenityType[];
    hasFamily: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): UserPreferencesEntity {
    return new UserPreferencesEntity(
      params.id,
      params.userId,
      params.workLat,
      params.workLng,
      params.maxCommuteMinutes,
      params.amenities,
      params.hasFamily,
      params.createdAt,
      params.updatedAt,
    );
  }

  hasAmenity(amenity: AmenityType): boolean {
    return this.amenities.includes(amenity);
  }

  amenityCount(): number {
    return this.amenities.length;
  }
}
