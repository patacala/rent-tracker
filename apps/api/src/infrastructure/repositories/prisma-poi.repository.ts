import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { IPOIRepository } from '../../domain/repositories';
import { POIEntity, type POICategory } from '../../domain/entities/poi.entity';

@Injectable()
export class PrismaPOIRepository implements IPOIRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<POIEntity | null> {
    const raw = await this.prisma.pOI.findUnique({ where: { id } });
    return raw ? this.toEntity(raw) : null;
  }

  async findByNeighborhood(neighborhoodId: string): Promise<POIEntity[]> {
    // Return up to 10 POIs per category to keep response size manageable
    const categories = await this.prisma.pOI.findMany({
      where: { neighborhoodId },
      select: { category: true },
      distinct: ['category'],
    });

    const perCategory = await Promise.all(
      categories.map(({ category }) =>
        this.prisma.pOI.findMany({
          where: { neighborhoodId, category },
          take: 10,
          select: {
            id: true,
            neighborhoodId: true,
            category: true,
            name: true,
            latitude: true,
            longitude: true,
            cachedAt: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
      ),
    );

    return perCategory.flat().map(r => this.toEntity(r));
  }

  async findByNeighborhoodAndCategory(
    neighborhoodId: string,
    category: POICategory,
  ): Promise<POIEntity[]> {
    const raw = await this.prisma.pOI.findMany({
      where: { neighborhoodId, category },
    });

    return raw.map(r => this.toEntity(r));
  }

  async createMany(pois: Array<{
    neighborhoodId: string;
    category: POICategory;
    name: string;
    latitude: number;
    longitude: number;
    metadata?: Record<string, any>;
    mapboxId?: string;
  }>): Promise<POIEntity[]> {
    if (pois.length === 0) return [];

    const neighborhoodId = pois[0].neighborhoodId;

    await this.prisma.pOI.createMany({
      data: pois.map(p => ({
        neighborhoodId: p.neighborhoodId,
        category: p.category,
        name: p.name,
        latitude: p.latitude,
        longitude: p.longitude,
        metadata: p.metadata as any,
        mapboxId: p.mapboxId,
      })),
      skipDuplicates: true,
    });

    // Return up to 10 POIs per category for this neighborhood (keeps response lean)
    const categories = [...new Set(pois.map(p => p.category))];
    const perCategory = await Promise.all(
      categories.map(category =>
        this.prisma.pOI.findMany({
          where: { neighborhoodId, category },
          take: 10,
          select: {
            id: true,
            neighborhoodId: true,
            category: true,
            name: true,
            latitude: true,
            longitude: true,
            cachedAt: true,
            createdAt: true,
            updatedAt: true,
            // metadata excluded — too heavy for API response
          },
        }),
      ),
    );

    return perCategory.flat().map(r => this.toEntity(r));
  }

  async deleteByNeighborhood(neighborhoodId: string): Promise<number> {
    const result = await this.prisma.pOI.deleteMany({
      where: { neighborhoodId },
    });

    return result.count;
  }

  async deleteStaleCache(olderThanHours: number): Promise<number> {
    const threshold = new Date();
    threshold.setHours(threshold.getHours() - olderThanHours);

    const result = await this.prisma.pOI.deleteMany({
      where: { cachedAt: { lt: threshold } },
    });

    return result.count;
  }

  private toEntity(raw: any): POIEntity {
    return POIEntity.create({
      id: raw.id,
      neighborhoodId: raw.neighborhoodId,
      category: raw.category as POICategory,
      name: raw.name,
      latitude: raw.latitude,
      longitude: raw.longitude,
      metadata: raw.metadata ?? undefined,
      mapboxId: raw.mapboxId ?? undefined,
      cachedAt: raw.cachedAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
