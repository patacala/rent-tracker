import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  IUserRepository,
  IUserPreferencesRepository,
  USER_REPOSITORY,
  USER_PREFERENCES_REPOSITORY,
} from '@domain/repositories';
import type { UserPreferencesEntity } from '@domain/entities/user-preferences.entity';
import type { AmenityType, CommuteOption } from '@rent-tracker/types';

export interface SaveUserPreferencesInput {
  userId: string;
  workLat: number;
  workLng: number;
  maxCommuteMinutes: CommuteOption;
  amenities: AmenityType[];
  hasFamily: boolean;
}

export interface SaveUserPreferencesOutput {
  preferences: UserPreferencesEntity;
}

@Injectable()
export class SaveUserPreferencesUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(USER_PREFERENCES_REPOSITORY)
    private readonly preferencesRepository: IUserPreferencesRepository,
  ) {}

  async execute(input: SaveUserPreferencesInput): Promise<SaveUserPreferencesOutput> {
    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      throw new NotFoundException(`User ${input.userId} not found`);
    }

    const preferences = await this.preferencesRepository.upsert({
      userId: input.userId,
      workLat: input.workLat,
      workLng: input.workLng,
      maxCommuteMinutes: input.maxCommuteMinutes,
      amenities: input.amenities,
      hasFamily: input.hasFamily,
    });

    return { preferences };
  }
}
