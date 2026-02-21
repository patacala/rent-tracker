export type POICategory =
  | 'school'
  | 'park'
  | 'shop'
  | 'transit'
  | 'gym'
  | 'hospital'
  | 'restaurant'
  | 'bar'
  | 'cafe'
  | 'supermarket';

export class POIEntity {
  constructor(
    public readonly id: string,
    public readonly neighborhoodId: string,
    public readonly category: POICategory,
    public readonly name: string,
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly metadata: Record<string, any> | null,
    public readonly mapboxId: string | null,
    public readonly cachedAt: Date,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(params: {
    id: string;
    neighborhoodId: string;
    category: POICategory;
    name: string;
    latitude: number;
    longitude: number;
    metadata?: Record<string, any>;
    mapboxId?: string;
    cachedAt: Date;
    createdAt: Date;
    updatedAt: Date;
  }): POIEntity {
    return new POIEntity(
      params.id,
      params.neighborhoodId,
      params.category,
      params.name,
      params.latitude,
      params.longitude,
      params.metadata ?? null,
      params.mapboxId ?? null,
      params.cachedAt,
      params.createdAt,
      params.updatedAt,
    );
  }

  isCacheValid(ttlHours: number = 24): boolean {
    const now = new Date();
    const diffMs = now.getTime() - this.cachedAt.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours < ttlHours;
  }
}
