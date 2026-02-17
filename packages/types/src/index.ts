// ─────────────────────────────────────────────
// Relocation Intelligence — Shared Types
// Used by both backend (NestJS) and frontend (Expo)
// ─────────────────────────────────────────────

// ─── Enums ─────────────────────────────────

export enum AmenityType {
  SUPERMARKET = 'SUPERMARKET',
  PHARMACY = 'PHARMACY',
  GYM = 'GYM',
  RESTAURANT = 'RESTAURANT',
  PARK = 'PARK',
  SCHOOL = 'SCHOOL',
  HOSPITAL = 'HOSPITAL',
  COFFEE_SHOP = 'COFFEE_SHOP',
  PUBLIC_TRANSPORT = 'PUBLIC_TRANSPORT',
}

export enum CommuteOption {
  FIFTEEN = 15,
  THIRTY = 30,
  FORTY_FIVE = 45,
}

export enum ScoreLevel {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
}

// ─── Core Entities ──────────────────────────

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  id: string;
  userId: string;
  workLat: number;
  workLng: number;
  maxCommuteMinutes: CommuteOption;
  amenities: AmenityType[];
  hasFamily: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchSession {
  id: string;
  userId: string;
  city: string;
  preferencesSnapshot: UserPreferences;
  results: NeighborhoodScore[];
  createdAt: Date;
}

// ─── Lifestyle Scoring ──────────────────────

export interface LifestyleScore {
  overall: number; // 0–100
  level: ScoreLevel;
  breakdown: ScoreBreakdown;
}

export interface ScoreBreakdown {
  commute: number; // 0–100 (weight: 40%)
  amenities: number; // 0–100 (weight: 40%)
  family: number; // 0–100 (weight: 20%)
}

export interface NeighborhoodScore {
  neighborhoodId: string;
  name: string;
  lat: number;
  lng: number;
  score: LifestyleScore;
  city: string;
}

// ─── API Request / Response DTOs ────────────

// POST /users
export interface CreateUserRequest {
  email: string;
  name?: string;
}

export interface CreateUserResponse {
  user: User;
}

// POST /preferences
export interface SavePreferencesRequest {
  userId: string;
  workLat: number;
  workLng: number;
  maxCommuteMinutes: CommuteOption;
  amenities: AmenityType[];
  hasFamily: boolean;
}

export interface SavePreferencesResponse {
  preferences: UserPreferences;
}

// POST /lifestyle-score
export interface CalculateLifestyleScoreRequest {
  userId: string;
  city?: string; // defaults to 'miami'
}

export interface CalculateLifestyleScoreResponse {
  sessionId: string;
  city: string;
  neighborhoods: NeighborhoodScore[];
  calculatedAt: Date;
}

// ─── Generic API Wrapper ─────────────────────

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

// ─── Map / Geo Types ─────────────────────────

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface MapRegion extends Coordinates {
  latitudeDelta: number;
  longitudeDelta: number;
}

// ─── Onboarding ──────────────────────────────

export interface OnboardingFormData {
  workAddress: string;
  workCoordinates?: Coordinates;
  maxCommuteMinutes: CommuteOption;
  amenities: AmenityType[];
  hasFamily: boolean;
}
