export declare enum AmenityType {
    SUPERMARKET = "SUPERMARKET",
    PHARMACY = "PHARMACY",
    GYM = "GYM",
    RESTAURANT = "RESTAURANT",
    PARK = "PARK",
    SCHOOL = "SCHOOL",
    HOSPITAL = "HOSPITAL",
    COFFEE_SHOP = "COFFEE_SHOP",
    PUBLIC_TRANSPORT = "PUBLIC_TRANSPORT"
}
export declare enum CommuteOption {
    FIFTEEN = 15,
    THIRTY = 30,
    FORTY_FIVE = 45
}
export declare enum ScoreLevel {
    EXCELLENT = "EXCELLENT",
    GOOD = "GOOD",
    FAIR = "FAIR",
    POOR = "POOR"
}
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
export interface LifestyleScore {
    overall: number;
    level: ScoreLevel;
    breakdown: ScoreBreakdown;
}
export interface ScoreBreakdown {
    commute: number;
    amenities: number;
    family: number;
}
export interface NeighborhoodScore {
    neighborhoodId: string;
    name: string;
    lat: number;
    lng: number;
    score: LifestyleScore;
    city: string;
}
export interface CreateUserRequest {
    email: string;
    name?: string;
}
export interface CreateUserResponse {
    user: User;
}
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
export interface CalculateLifestyleScoreRequest {
    userId: string;
    city?: string;
}
export interface CalculateLifestyleScoreResponse {
    sessionId: string;
    city: string;
    neighborhoods: NeighborhoodScore[];
    calculatedAt: Date;
}
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
export interface Coordinates {
    lat: number;
    lng: number;
}
export interface MapRegion extends Coordinates {
    latitudeDelta: number;
    longitudeDelta: number;
}
export interface OnboardingFormData {
    workAddress: string;
    workCoordinates?: Coordinates;
    maxCommuteMinutes: CommuteOption;
    amenities: AmenityType[];
    hasFamily: boolean;
}
//# sourceMappingURL=index.d.ts.map