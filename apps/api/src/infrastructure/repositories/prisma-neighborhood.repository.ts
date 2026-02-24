import { Injectable } from '@nestjs/common';
import { GeoJSON } from 'geojson';
import { PrismaService } from '../prisma/prisma.service';
import type { INeighborhoodRepository } from '../../domain/repositories';
import { NeighborhoodEntity } from '../../domain/entities/neighborhood.entity';

@Injectable()
export class PrismaNeighborhoodRepository implements INeighborhoodRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<NeighborhoodEntity | null> {
    const raw = await this.prisma.neighborhood.findUnique({ where: { id } });
    return raw ? this.toEntity(raw) : null;
  }

  async findByName(name: string): Promise<NeighborhoodEntity | null> {
    const raw = await this.prisma.neighborhood.findFirst({ where: { name } });
    return raw ? this.toEntity(raw) : null;
  }

  async findWithinBounds(polygon: GeoJSON.Polygon): Promise<NeighborhoodEntity[]> {
    // Calculate bounding box for initial filtering
    const bbox = this.calculateBoundingBox(polygon);

    const raw = await this.prisma.neighborhood.findMany({
      where: {
        centerLat: { gte: bbox.minLat, lte: bbox.maxLat },
        centerLng: { gte: bbox.minLng, lte: bbox.maxLng },
      },
    });

    return raw.map(r => this.toEntity(r));
  }

  async findNearPoint(lat: number, lng: number, radiusKm: number): Promise<NeighborhoodEntity[]> {
    // Simple bounding box approximation (1 degree ≈ 111km)
    const latDelta = radiusKm / 111;
    const lngDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180));

    const raw = await this.prisma.neighborhood.findMany({
      where: {
        centerLat: { gte: lat - latDelta, lte: lat + latDelta },
        centerLng: { gte: lng - lngDelta, lte: lng + lngDelta },
      },
    });

    return raw.map(r => this.toEntity(r));
  }

  async create(params: {
    name: string;
    boundary: GeoJSON.Polygon;
    source: 'mapbox_tilequery' | 'mapbox_boundaries' | 'osm_overpass' | 'static_miami_config' | 'manual';
    centerLat: number;
    centerLng: number;
  }): Promise<NeighborhoodEntity> {
    const raw = await this.prisma.neighborhood.create({
      data: {
        name: params.name,
        boundary: params.boundary as any,
        source: params.source,
        centerLat: params.centerLat,
        centerLng: params.centerLng,
      },
    });

    return this.toEntity(raw);
  }

  async upsert(params: {
    id: string;
    name: string;
    boundary: GeoJSON.Polygon;
    source: 'mapbox_tilequery' | 'mapbox_boundaries' | 'osm_overpass' | 'static_miami_config' | 'manual';
    centerLat: number;
    centerLng: number;
  }): Promise<NeighborhoodEntity> {
    const raw = await this.prisma.neighborhood.upsert({
      where: { id: params.id },
      create: {
        id: params.id,
        name: params.name,
        boundary: params.boundary as any,
        source: params.source,
        centerLat: params.centerLat,
        centerLng: params.centerLng,
      },
      update: {
        name: params.name,
        boundary: params.boundary as any,
        source: params.source,
        centerLat: params.centerLat,
        centerLng: params.centerLng,
        cachedAt: new Date(),
      },
    });

    return this.toEntity(raw);
  }

  async update(id: string, params: Partial<{
    name: string;
    boundary: GeoJSON.Polygon;
    photoUrl: string;
    cachedAt: Date;
  }>): Promise<NeighborhoodEntity> {
    const raw = await this.prisma.neighborhood.update({
      where: { id },
      data: params as any,
    });

    return this.toEntity(raw);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.neighborhood.delete({ where: { id } });
  }

  async deleteStaleCache(olderThanDays: number): Promise<number> {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - olderThanDays);

    const result = await this.prisma.neighborhood.deleteMany({
      where: { cachedAt: { lt: threshold } },
    });

    return result.count;
  }

  private toEntity(raw: any): NeighborhoodEntity {
    return NeighborhoodEntity.create({
      id: raw.id,
      name: raw.name,
      boundary: raw.boundary as GeoJSON.Polygon,
      source: raw.source,
      centerLat: raw.centerLat,
      centerLng: raw.centerLng,
      photoUrl: raw.photoUrl ?? null,
      cachedAt: raw.cachedAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  private calculateBoundingBox(polygon: GeoJSON.Polygon): {
    minLng: number;
    minLat: number;
    maxLng: number;
    maxLat: number
  } {
    const coordinates = polygon.coordinates[0];

    let minLng = Infinity, minLat = Infinity;
    let maxLng = -Infinity, maxLat = -Infinity;

    for (const [lng, lat] of coordinates) {
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }

    return { minLng, minLat, maxLng, maxLat };
  }
}
