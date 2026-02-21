import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { ISearchSessionRepository } from '../../domain/repositories';

@Injectable()
export class PrismaSearchSessionRepository implements ISearchSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(params: {
    userId: string;
    longitude: number;
    latitude: number;
    timeMinutes: number;
    mode: string;
    neighborhoodIds: string[];
  }): Promise<void> {
    await this.prisma.searchSession.create({
      data: {
        userId: params.userId,
        longitude: params.longitude,
        latitude: params.latitude,
        timeMinutes: params.timeMinutes,
        mode: params.mode,
        neighborhoodIds: params.neighborhoodIds,
      },
    });
  }

  async findLatestByUserId(userId: string): Promise<{
    neighborhoodIds: string[];
    longitude: number;
    latitude: number;
    timeMinutes: number;
    mode: string;
    createdAt: Date;
  } | null> {
    const session = await this.prisma.searchSession.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!session) return null;

    return {
      neighborhoodIds: session.neighborhoodIds,
      longitude: session.longitude,
      latitude: session.latitude,
      timeMinutes: session.timeMinutes,
      mode: session.mode,
      createdAt: session.createdAt,
    };
  }
}
