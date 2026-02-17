import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { IUserPreferencesRepository } from '@domain/repositories';
import { UserPreferencesEntity } from '@domain/entities/user-preferences.entity';
import type { AmenityType, CommuteOption } from '@rent-tracker/types';

@Injectable()
export class PrismaUserPreferencesRepository implements IUserPreferencesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<UserPreferencesEntity | null> {
    const prefs = await this.prisma.userPreferences.findUnique({ where: { userId } });
    return prefs ? this.toEntity(prefs) : null;
  }

  async upsert(params: {
    userId: string;
    workLat: number;
    workLng: number;
    maxCommuteMinutes: CommuteOption;
    amenities: AmenityType[];
    hasFamily: boolean;
  }): Promise<UserPreferencesEntity> {
    const data = {
      workLat: params.workLat,
      workLng: params.workLng,
      maxCommuteMinutes: params.maxCommuteMinutes,
      amenities: params.amenities as string[],
      hasFamily: params.hasFamily,
    };

    const prefs = await this.prisma.userPreferences.upsert({
      where: { userId: params.userId },
      create: { userId: params.userId, ...data },
      update: data,
    });

    return this.toEntity(prefs);
  }

  private toEntity(raw: {
    id: string;
    userId: string;
    workLat: number;
    workLng: number;
    maxCommuteMinutes: number;
    amenities: string[];
    hasFamily: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): UserPreferencesEntity {
    return UserPreferencesEntity.create({
      id: raw.id,
      userId: raw.userId,
      workLat: raw.workLat,
      workLng: raw.workLng,
      maxCommuteMinutes: raw.maxCommuteMinutes as CommuteOption,
      amenities: raw.amenities as AmenityType[],
      hasFamily: raw.hasFamily,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
