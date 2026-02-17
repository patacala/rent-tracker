import type { UserEntity } from '../entities/user.entity';
import type { UserPreferencesEntity } from '../entities/user-preferences.entity';
import type { SearchSessionEntity } from '../entities/search-session.entity';
import type { AmenityType, CommuteOption } from '@rent-tracker/types';

// ─── Repository Interfaces (Domain Layer) ────
// Defined in domain, implemented in infrastructure

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  create(params: { email: string; name?: string }): Promise<UserEntity>;
  update(id: string, params: Partial<{ name: string }>): Promise<UserEntity>;
  delete(id: string): Promise<void>;
}

export interface IUserPreferencesRepository {
  findByUserId(userId: string): Promise<UserPreferencesEntity | null>;
  upsert(params: {
    userId: string;
    workLat: number;
    workLng: number;
    maxCommuteMinutes: CommuteOption;
    amenities: AmenityType[];
    hasFamily: boolean;
  }): Promise<UserPreferencesEntity>;
}

export interface ISearchSessionRepository {
  findById(id: string): Promise<SearchSessionEntity | null>;
  findByUserId(userId: string): Promise<SearchSessionEntity[]>;
  create(params: Omit<SearchSessionEntity, 'id' | 'createdAt'>): Promise<SearchSessionEntity>;
}

// ─── Injection Tokens ────────────────────────
export const USER_REPOSITORY = 'IUserRepository';
export const USER_PREFERENCES_REPOSITORY = 'IUserPreferencesRepository';
export const SEARCH_SESSION_REPOSITORY = 'ISearchSessionRepository';
