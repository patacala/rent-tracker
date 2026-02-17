import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { ISearchSessionRepository } from '@domain/repositories';
import { SearchSessionEntity } from '@domain/entities/search-session.entity';
import type { UserPreferencesEntity } from '@domain/entities/user-preferences.entity';
import type { NeighborhoodScore } from '@rent-tracker/types';

@Injectable()
export class PrismaSearchSessionRepository implements ISearchSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<SearchSessionEntity | null> {
    const session = await this.prisma.searchSession.findUnique({ where: { id } });
    return session ? this.toEntity(session) : null;
  }

  async findByUserId(userId: string): Promise<SearchSessionEntity[]> {
    const sessions = await this.prisma.searchSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    return sessions.map((s) => this.toEntity(s));
  }

  async create(
    params: Omit<SearchSessionEntity, 'id' | 'createdAt'>,
  ): Promise<SearchSessionEntity> {
    const session = await this.prisma.searchSession.create({
      data: {
        userId: params.userId,
        city: params.city,
        preferencesSnapshot: params.preferencesSnapshot as unknown as Record<string, unknown>,
        results: params.results as unknown as Record<string, unknown>[],
      },
    });
    return this.toEntity(session);
  }

  private toEntity(raw: {
    id: string;
    userId: string;
    city: string;
    preferencesSnapshot: unknown;
    results: unknown;
    createdAt: Date;
  }): SearchSessionEntity {
    return SearchSessionEntity.create({
      id: raw.id,
      userId: raw.userId,
      city: raw.city,
      preferencesSnapshot: raw.preferencesSnapshot as UserPreferencesEntity,
      results: raw.results as NeighborhoodScore[],
      createdAt: raw.createdAt,
    });
  }
}
