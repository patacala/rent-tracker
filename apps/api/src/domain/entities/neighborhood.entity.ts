import { GeoJSON } from 'geojson';

export class NeighborhoodEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly boundary: GeoJSON.Polygon,
    public readonly source: 'mapbox_tilequery' | 'mapbox_boundaries' | 'osm_overpass' | 'static_miami_config' | 'manual',
    public readonly centerLat: number,
    public readonly centerLng: number,
    public readonly photoUrl: string | null,
    public readonly cachedAt: Date,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(params: {
    id: string;
    name: string;
    boundary: GeoJSON.Polygon;
    source: 'mapbox_tilequery' | 'mapbox_boundaries' | 'osm_overpass' | 'static_miami_config' | 'manual';
    centerLat: number;
    centerLng: number;
    photoUrl?: string | null;
    cachedAt: Date;
    createdAt: Date;
    updatedAt: Date;
  }): NeighborhoodEntity {
    return new NeighborhoodEntity(
      params.id,
      params.name,
      params.boundary,
      params.source,
      params.centerLat,
      params.centerLng,
      params.photoUrl ?? null,
      params.cachedAt,
      params.createdAt,
      params.updatedAt,
    );
  }

  isCacheValid(ttlDays: number = 7): boolean {
    const now = new Date();
    const diffMs = now.getTime() - this.cachedAt.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays < ttlDays;
  }
}
