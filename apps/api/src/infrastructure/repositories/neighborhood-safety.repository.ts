import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import type { NeighborhoodSafetyEntity } from '../../domain/entities/neighborhood-safety.entity';
import { INeighborhoodSafetyRepository } from '@domain/repositories';

@Injectable()
export class NeighborhoodSafetyRepository implements INeighborhoodSafetyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByName(neighborhoodName: string): Promise<NeighborhoodSafetyEntity | null> {
    const record = await this.prisma.neighborhoodSafety.findUnique({
      where: { neighborhoodName },
    });
    if (!record) return null;
    return this.toEntity(record);
  }

  async upsert(
    data: Omit<NeighborhoodSafetyEntity, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<NeighborhoodSafetyEntity> {
    const record = await this.prisma.neighborhoodSafety.upsert({
      where: { neighborhoodName: data.neighborhoodName },
      create: {
        neighborhoodName: data.neighborhoodName,
        crimeScore: data.crimeScore,
        crimeNumeric: data.crimeNumeric,
        crimeDescription: data.crimeDescription,
        crimeBreakdown: data.crimeBreakdown as any,
        incidents: data.incidents as any,
        cachedAt: data.cachedAt,
      },
      update: {
        crimeScore: data.crimeScore,
        crimeNumeric: data.crimeNumeric,
        crimeDescription: data.crimeDescription,
        crimeBreakdown: data.crimeBreakdown as any,
        incidents: data.incidents as any,
        cachedAt: data.cachedAt,
      },
    });
    return this.toEntity(record);
  }

  isExpired(cachedAt: Date, ttlDays = 7): boolean {
    const now = new Date();
    const diffMs = now.getTime() - cachedAt.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays > ttlDays;
  }

  private toEntity(record: any): NeighborhoodSafetyEntity {
    return {
      id: record.id,
      neighborhoodName: record.neighborhoodName,
      crimeScore: record.crimeScore,
      crimeNumeric: record.crimeNumeric,
      crimeDescription: record.crimeDescription,
      crimeBreakdown: record.crimeBreakdown,
      incidents: record.incidents,
      cachedAt: record.cachedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}