import type { LifestyleScore, ScoreBreakdown, ScoreLevel } from '@rent-tracker/types';
/**
 * Derives the ScoreLevel label from a numeric score (0–100)
 */
export declare function getScoreLevel(score: number): ScoreLevel;
/**
 * Calculates the weighted lifestyle score
 * Commute: 40% | Amenities: 40% | Family: 20%
 */
export declare function calculateWeightedScore(breakdown: ScoreBreakdown): number;
/**
 * Builds a full LifestyleScore from its parts
 */
export declare function buildLifestyleScore(breakdown: ScoreBreakdown): LifestyleScore;
/**
 * Returns a hex color for a given score (red → yellow → green)
 */
export declare function scoreToColor(score: number): string;
/**
 * Returns RGBA for map polygon overlays
 */
export declare function scoreToMapFill(score: number, opacity?: number): string;
/**
 * Haversine formula — distance in km between two coordinates
 */
export declare function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number;
export declare function formatScore(score: number): string;
export declare function formatCommuteMinutes(minutes: number): string;
export declare function capitalizeFirst(str: string): string;
//# sourceMappingURL=index.d.ts.map