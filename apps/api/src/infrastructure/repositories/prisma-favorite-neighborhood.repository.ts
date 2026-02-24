import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { IFavoriteNeighborhoodRepository } from '../../domain/repositories';

@Injectable()
export class PrismaFavoriteNeighborhoodRepository implements IFavoriteNeighborhoodRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(params: { userId: string; neighborhoodId: string }): Promise<void> {
    await this.prisma.favoriteNeighborhood.create({
      data: {
        userId: params.userId,
        neighborhoodId: params.neighborhoodId,
      },
    });
  }

  async delete(params: { userId: string; neighborhoodId: string }): Promise<void> {
    await this.prisma.favoriteNeighborhood.deleteMany({
      where: {
        userId: params.userId,
        neighborhoodId: params.neighborhoodId,
      },
    });
  }

  async findByUserId(userId: string): Promise<{ neighborhoodId: string; createdAt: Date }[]> {
    const results = await this.prisma.favoriteNeighborhood.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return results.map((r) => ({
      neighborhoodId: r.neighborhoodId,
      createdAt: r.createdAt,
    }));
  }

  async isFavorite(params: { userId: string; neighborhoodId: string }): Promise<boolean> {
    const record = await this.prisma.favoriteNeighborhood.findUnique({
      where: {
        userId_neighborhoodId: {
          userId: params.userId,
          neighborhoodId: params.neighborhoodId,
        },
      },
    });

    return !!record;
  }
}