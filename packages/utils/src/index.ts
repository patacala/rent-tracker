import type {
  LifestyleScore,
  ScoreBreakdown,
  ScoreLevel,
  ScoreWeights,
  PriorityKey,
  PriorityMatchConfig,
} from '@rent-tracker/types';
import {
  COMMUTE_OPTIONS,
  PRIORITY_TO_POI_CATEGORIES,
  PRIORITY_TERM_TO_KEY,
  PRIORITY_MATCH_CONFIG,
} from '@rent-tracker/config';

// ─── Score Level ─────────────────────────────

export function getScoreLevel(score: number): ScoreLevel {
  if (score >= 80) return 'EXCELLENT' as ScoreLevel;
  if (score >= 60) return 'GOOD' as ScoreLevel;
  if (score >= 40) return 'FAIR' as ScoreLevel;
  return 'POOR' as ScoreLevel;
}

// ─── Commute Score ───────────────────────────

/**
 * Score derivado de COMMUTE_OPTIONS min/max — sin magic numbers.
 * Commute más estricto (15 min) → 100; más flexible (60 min) → 0.
 */
export function calculateCommuteScore(
  commuteMinutes: number,
  options: readonly number[] = COMMUTE_OPTIONS,
): number {
  const min = Math.min(...options);
  const max = Math.max(...options);
  if (max === min) return 100;
  const raw = (max - commuteMinutes) / (max - min);
  return Math.round(Math.max(0, Math.min(1, raw)) * 100);
}

// ─── Amenities Score ─────────────────────────

/**
 * Score basado en variedad y densidad de POIs vs categorías conocidas totales.
 * Reemplaza la fórmula arbitraria `uniqueCategories * 12 + pois.length * 1.5`.
 * La densidad usa escala log con 20 POIs como referencia de saturación.
 */
export function calculateAmenitiesScore(
  uniqueCategoryCount: number,
  totalPOICount: number,
  totalKnownCategories: number,
): number {
  const varietyScore = totalKnownCategories > 0
    ? (uniqueCategoryCount / totalKnownCategories) * 100
    : 0;
  const densityScore = Math.min(
    (Math.log(1 + totalPOICount) / Math.log(1 + 20)) * 100,
    100,
  );
  return Math.round(0.6 * varietyScore + 0.4 * densityScore);
}

// ─── Priority Match Score ────────────────────

/**
 * Score de una categoría específica para el match del usuario.
 * idealCount es dinámico: proporcional al tamaño total del barrio (totalPOIs * idealRatio),
 * con un piso (minIdealCount) para barrios pequeños.
 */
export function scoreForPriorityMatch(
  config: PriorityMatchConfig,
  poiCount: number,
  totalPOIs: number,
): number {
  if (poiCount <= 0) return 0;
  const dynamicIdeal = Math.max(
    config.minIdealCount,
    Math.ceil(totalPOIs * config.idealRatio),
  );
  const raw = Math.min(poiCount / dynamicIdeal, 1);
  const boosted = Math.min(raw * config.weight, 1);
  return Math.round(config.base + boosted * (100 - config.base));
}

// ─── Priority Key Resolution ─────────────────

export function resolvePriorityKey(term: string): PriorityKey {
  return PRIORITY_TERM_TO_KEY[term.toLowerCase()] ?? 'default';
}

// ─── Priority Terms ──────────────────────────

/**
 * Versión sin dependencia de OnboardingData (tipo mobile).
 * Expande las prioridades del usuario a términos de categorías de POI.
 */
export function getEffectivePriorityTerms(
  priorities: string[],
  hasChildren: boolean,
  hasPets: boolean,
): string[] {
  const terms = priorities.flatMap(
    (p) => PRIORITY_TO_POI_CATEGORIES[p.toLowerCase()] ?? [p.toLowerCase()],
  );
  if (hasChildren) terms.push('school', 'park');
  if (hasPets) terms.push('park');
  return [...new Set(terms)];
}

// ─── Category Matching ───────────────────────

export function categoryMatchesTerm(category: string, term: string): boolean {
  return category.includes(term) || term.includes(category);
}

export function isRelevantCategory(category: string, priorityTerms: string[]): boolean {
  return priorityTerms.some((term) => categoryMatchesTerm(category, term));
}

// ─── Dynamic Score Weights ───────────────────

/**
 * Pesos derivados del perfil del usuario:
 * - Más prioridades seleccionadas → priorityMatch sube
 * - Commute más estricto (15 min) → commute sube
 * Los pesos siempre suman 1.0 (normalizados al final).
 */
export function deriveScoreWeights(
  priorityCount: number,
  commuteMinutes: number,
  options: readonly number[] = COMMUTE_OPTIONS,
): ScoreWeights {
  const min = Math.min(...options);
  const max = Math.max(...options);
  const commuteStrictness = max === min ? 1 : (max - commuteMinutes) / (max - min);

  const commuteWeight   = 0.30 + commuteStrictness * 0.15;
  const priorityWeight  = priorityCount > 0
    ? Math.min(0.25 + priorityCount * 0.05, 0.50)
    : 0.15;
  const amenitiesWeight = Math.max(1 - commuteWeight - priorityWeight, 0.05);

  const total = commuteWeight + priorityWeight + amenitiesWeight;
  return {
    commute:       commuteWeight   / total,
    priorityMatch: priorityWeight  / total,
    amenities:     amenitiesWeight / total,
  };
}

// ─── Weighted Score ──────────────────────────

/**
 * Calcula el score total del barrio con pesos dinámicos.
 * Los pesos deben provenir de deriveScoreWeights().
 */
export function calculateWeightedScore(
  breakdown: ScoreBreakdown,
  weights: ScoreWeights,
): number {
  return Math.round(
    breakdown.commute       * weights.commute +
    breakdown.priorityMatch * weights.priorityMatch +
    breakdown.amenities     * weights.amenities,
  );
}

export function buildLifestyleScore(breakdown: ScoreBreakdown, weights: ScoreWeights): LifestyleScore {
  const overall = calculateWeightedScore(breakdown, weights);
  return {
    overall,
    level: getScoreLevel(overall),
    breakdown,
  };
}

// ─── Map Color Utilities ─────────────────────

export function scoreToColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#84cc16';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
}

export function scoreToMapFill(score: number, opacity = 0.4): string {
  if (score >= 80) return `rgba(34, 197, 94, ${opacity})`;
  if (score >= 60) return `rgba(132, 204, 22, ${opacity})`;
  if (score >= 40) return `rgba(245, 158, 11, ${opacity})`;
  return `rgba(239, 68, 68, ${opacity})`;
}

// ─── Geo Utilities ───────────────────────────

export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// ─── Format Utilities ────────────────────────

export function formatScore(score: number): string {
  return `${score}/100`;
}

export function formatCommuteMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// ─── Re-exports for convenience ──────────────

export { PRIORITY_MATCH_CONFIG };
export type { PriorityKey, PriorityMatchConfig, ScoreWeights };
