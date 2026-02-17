"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScoreLevel = getScoreLevel;
exports.calculateWeightedScore = calculateWeightedScore;
exports.buildLifestyleScore = buildLifestyleScore;
exports.scoreToColor = scoreToColor;
exports.scoreToMapFill = scoreToMapFill;
exports.distanceKm = distanceKm;
exports.formatScore = formatScore;
exports.formatCommuteMinutes = formatCommuteMinutes;
exports.capitalizeFirst = capitalizeFirst;
// ─── Score Utilities ─────────────────────────
/**
 * Derives the ScoreLevel label from a numeric score (0–100)
 */
function getScoreLevel(score) {
    if (score >= 80)
        return 'EXCELLENT';
    if (score >= 60)
        return 'GOOD';
    if (score >= 40)
        return 'FAIR';
    return 'POOR';
}
/**
 * Calculates the weighted lifestyle score
 * Commute: 40% | Amenities: 40% | Family: 20%
 */
function calculateWeightedScore(breakdown) {
    const commute = breakdown.commute * 0.4;
    const amenities = breakdown.amenities * 0.4;
    const family = breakdown.family * 0.2;
    return Math.round(commute + amenities + family);
}
/**
 * Builds a full LifestyleScore from its parts
 */
function buildLifestyleScore(breakdown) {
    const overall = calculateWeightedScore(breakdown);
    return {
        overall,
        level: getScoreLevel(overall),
        breakdown,
    };
}
// ─── Map Color Utilities ─────────────────────
/**
 * Returns a hex color for a given score (red → yellow → green)
 */
function scoreToColor(score) {
    if (score >= 80)
        return '#22c55e'; // green-500
    if (score >= 60)
        return '#84cc16'; // lime-500
    if (score >= 40)
        return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
}
/**
 * Returns RGBA for map polygon overlays
 */
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
/**
 * Haversine formula — distance in km between two coordinates
 */
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