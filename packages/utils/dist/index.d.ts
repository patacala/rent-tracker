import type { LifestyleScore, ScoreBreakdown, ScoreLevel, ScoreWeights, PriorityKey, PriorityMatchConfig } from '@rent-tracker/types';
import { PRIORITY_MATCH_CONFIG } from '@rent-tracker/config';
export declare function getScoreLevel(score: number): ScoreLevel;
/**
 * Score derivado de COMMUTE_OPTIONS min/max — sin magic numbers.
 * Commute más estricto (15 min) → 100; más flexible (60 min) → 0.
 */
export declare function calculateCommuteScore(commuteMinutes: number, options?: readonly number[]): number;
/**
 * Score basado en variedad y densidad de POIs vs categorías conocidas totales.
 * Reemplaza la fórmula arbitraria `uniqueCategories * 12 + pois.length * 1.5`.
 * La densidad usa escala log con 20 POIs como referencia de saturación.
 */
export declare function calculateAmenitiesScore(uniqueCategoryCount: number, totalPOICount: number, totalKnownCategories: number): number;
/**
 * Score de una categoría específica para el match del usuario.
 * idealCount es dinámico: proporcional al tamaño total del barrio (totalPOIs * idealRatio),
 * con un piso (minIdealCount) para barrios pequeños.
 */
export declare function scoreForPriorityMatch(config: PriorityMatchConfig, poiCount: number, totalPOIs: number): number;
export declare function resolvePriorityKey(term: string): PriorityKey;
/**
 * Versión sin dependencia de OnboardingData (tipo mobile).
 * Expande las prioridades del usuario a términos de categorías de POI.
 */
export declare function getEffectivePriorityTerms(priorities: string[], hasChildren: boolean, hasPets: boolean): string[];
export declare function categoryMatchesTerm(category: string, term: string): boolean;
export declare function isRelevantCategory(category: string, priorityTerms: string[]): boolean;
/**
 * Pesos derivados del perfil del usuario:
 * - Más prioridades seleccionadas → priorityMatch sube
 * - Commute más estricto (15 min) → commute sube
 * Los pesos siempre suman 1.0 (normalizados al final).
 */
export declare function deriveScoreWeights(priorityCount: number, commuteMinutes: number, options?: readonly number[]): ScoreWeights;
/**
 * Calcula el score total del barrio con pesos dinámicos.
 * Los pesos deben provenir de deriveScoreWeights().
 */
export declare function calculateWeightedScore(breakdown: ScoreBreakdown, weights: ScoreWeights): number;
export declare function buildLifestyleScore(breakdown: ScoreBreakdown, weights: ScoreWeights): LifestyleScore;
export declare function scoreToColor(score: number): string;
export declare function scoreToMapFill(score: number, opacity?: number): string;
export declare function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number;
export declare function formatScore(score: number): string;
export declare function formatCommuteMinutes(minutes: number): string;
export declare function capitalizeFirst(str: string): string;
export { PRIORITY_MATCH_CONFIG };
export type { PriorityKey, PriorityMatchConfig, ScoreWeights };
//# sourceMappingURL=index.d.ts.map