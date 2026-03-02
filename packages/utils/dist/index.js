"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRIORITY_MATCH_CONFIG = void 0;
exports.getScoreLevel = getScoreLevel;
exports.calculateCommuteScore = calculateCommuteScore;
exports.calculateAmenitiesScore = calculateAmenitiesScore;
exports.scoreForPriorityMatch = scoreForPriorityMatch;
exports.resolvePriorityKey = resolvePriorityKey;
exports.getEffectivePriorityTerms = getEffectivePriorityTerms;
exports.categoryMatchesTerm = categoryMatchesTerm;
exports.isRelevantCategory = isRelevantCategory;
exports.deriveScoreWeights = deriveScoreWeights;
exports.calculateWeightedScore = calculateWeightedScore;
exports.buildLifestyleScore = buildLifestyleScore;
exports.scoreToColor = scoreToColor;
exports.scoreToMapFill = scoreToMapFill;
exports.distanceKm = distanceKm;
exports.formatScore = formatScore;
exports.formatCommuteMinutes = formatCommuteMinutes;
exports.capitalizeFirst = capitalizeFirst;
const config_1 = require("@rent-tracker/config");
Object.defineProperty(exports, "PRIORITY_MATCH_CONFIG", { enumerable: true, get: function () { return config_1.PRIORITY_MATCH_CONFIG; } });
// ─── Score Level ─────────────────────────────
function getScoreLevel(score) {
    if (score >= 80)
        return 'EXCELLENT';
    if (score >= 60)
        return 'GOOD';
    if (score >= 40)
        return 'FAIR';
    return 'POOR';
}
// ─── Commute Score ───────────────────────────
/**
 * Score derivado de COMMUTE_OPTIONS min/max — sin magic numbers.
 * Commute más estricto (15 min) → 100; más flexible (60 min) → 0.
 */
function calculateCommuteScore(commuteMinutes, options = config_1.COMMUTE_OPTIONS) {
    const min = Math.min(...options);
    const max = Math.max(...options);
    if (max === min)
        return 100;
    const raw = (max - commuteMinutes) / (max - min);
    return Math.round(Math.max(0, Math.min(1, raw)) * 100);
}
// ─── Amenities Score ─────────────────────────
/**
 * Score basado en variedad y densidad de POIs vs categorías conocidas totales.
 * Reemplaza la fórmula arbitraria `uniqueCategories * 12 + pois.length * 1.5`.
 * La densidad usa escala log con 20 POIs como referencia de saturación.
 */
function calculateAmenitiesScore(uniqueCategoryCount, totalPOICount, totalKnownCategories) {
    const varietyScore = totalKnownCategories > 0
        ? (uniqueCategoryCount / totalKnownCategories) * 100
        : 0;
    const densityScore = Math.min((Math.log(1 + totalPOICount) / Math.log(1 + 20)) * 100, 100);
    return Math.round(0.6 * varietyScore + 0.4 * densityScore);
}
// ─── Priority Match Score ────────────────────
/**
 * Score de una categoría específica para el match del usuario.
 * idealCount es dinámico: proporcional al tamaño total del barrio (totalPOIs * idealRatio),
 * con un piso (minIdealCount) para barrios pequeños.
 */
function scoreForPriorityMatch(config, poiCount, totalPOIs) {
    if (poiCount <= 0)
        return 0;
    const dynamicIdeal = Math.max(config.minIdealCount, Math.ceil(totalPOIs * config.idealRatio));
    const raw = Math.min(poiCount / dynamicIdeal, 1);
    const boosted = Math.min(raw * config.weight, 1);
    return Math.round(config.base + boosted * (100 - config.base));
}
// ─── Priority Key Resolution ─────────────────
function resolvePriorityKey(term) {
    return config_1.PRIORITY_TERM_TO_KEY[term.toLowerCase()] ?? 'default';
}
// ─── Priority Terms ──────────────────────────
/**
 * Versión sin dependencia de OnboardingData (tipo mobile).
 * Expande las prioridades del usuario a términos de categorías de POI.
 */
function getEffectivePriorityTerms(priorities, hasChildren, hasPets) {
    const terms = priorities.flatMap((p) => config_1.PRIORITY_TO_POI_CATEGORIES[p.toLowerCase()] ?? [p.toLowerCase()]);
    if (hasChildren)
        terms.push('school', 'park');
    if (hasPets)
        terms.push('park');
    return [...new Set(terms)];
}
// ─── Category Matching ───────────────────────
function categoryMatchesTerm(category, term) {
    return category.includes(term) || term.includes(category);
}
function isRelevantCategory(category, priorityTerms) {
    return priorityTerms.some((term) => categoryMatchesTerm(category, term));
}
// ─── Dynamic Score Weights ───────────────────
/**
 * Pesos derivados del perfil del usuario:
 * - Más prioridades seleccionadas → priorityMatch sube
 * - Commute más estricto (15 min) → commute sube
 * Los pesos siempre suman 1.0 (normalizados al final).
 */
function deriveScoreWeights(priorityCount, commuteMinutes, options = config_1.COMMUTE_OPTIONS) {
    const min = Math.min(...options);
    const max = Math.max(...options);
    const commuteStrictness = max === min ? 1 : (max - commuteMinutes) / (max - min);
    const commuteWeight = 0.30 + commuteStrictness * 0.15;
    const priorityWeight = priorityCount > 0
        ? Math.min(0.25 + priorityCount * 0.05, 0.50)
        : 0.15;
    const amenitiesWeight = Math.max(1 - commuteWeight - priorityWeight, 0.05);
    const total = commuteWeight + priorityWeight + amenitiesWeight;
    return {
        commute: commuteWeight / total,
        priorityMatch: priorityWeight / total,
        amenities: amenitiesWeight / total,
    };
}
// ─── Weighted Score ──────────────────────────
/**
 * Calcula el score total del barrio con pesos dinámicos.
 * Los pesos deben provenir de deriveScoreWeights().
 */
function calculateWeightedScore(breakdown, weights) {
    return Math.round(breakdown.commute * weights.commute +
        breakdown.priorityMatch * weights.priorityMatch +
        breakdown.amenities * weights.amenities);
}
function buildLifestyleScore(breakdown, weights) {
    const overall = calculateWeightedScore(breakdown, weights);
    return {
        overall,
        level: getScoreLevel(overall),
        breakdown,
    };
}
// ─── Map Color Utilities ─────────────────────
function scoreToColor(score) {
    if (score >= 80)
        return '#22c55e';
    if (score >= 60)
        return '#84cc16';
    if (score >= 40)
        return '#f59e0b';
    return '#ef4444';
}
function scoreToMapFill(score, opacity = 0.4) {
    if (score >= 80)
        return `rgba(34, 197, 94, ${opacity})`;
    if (score >= 60)
        return `rgba(132, 204, 22, ${opacity})`;
    if (score >= 40)
        return `rgba(245, 158, 11, ${opacity})`;
    return `rgba(239, 68, 68, ${opacity})`;
}
// ─── Geo Utilities ───────────────────────────
function distanceKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function toRad(deg) {
    return (deg * Math.PI) / 180;
}
// ─── Format Utilities ────────────────────────
function formatScore(score) {
    return `${score}/100`;
}
function formatCommuteMinutes(minutes) {
    if (minutes < 60)
        return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
}
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
//# sourceMappingURL=index.js.map