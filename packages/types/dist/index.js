"use strict";
// ─────────────────────────────────────────────
// Relocation Intelligence — Shared Types
// Used by both backend (NestJS) and frontend (Expo)
// ─────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScoreLevel = exports.CommuteOption = exports.AmenityType = void 0;
// ─── Enums ─────────────────────────────────
var AmenityType;
(function (AmenityType) {
    AmenityType["SUPERMARKET"] = "SUPERMARKET";
    AmenityType["PHARMACY"] = "PHARMACY";
    AmenityType["GYM"] = "GYM";
    AmenityType["RESTAURANT"] = "RESTAURANT";
    AmenityType["PARK"] = "PARK";
    AmenityType["SCHOOL"] = "SCHOOL";
    AmenityType["HOSPITAL"] = "HOSPITAL";
    AmenityType["COFFEE_SHOP"] = "COFFEE_SHOP";
    AmenityType["PUBLIC_TRANSPORT"] = "PUBLIC_TRANSPORT";
})(AmenityType || (exports.AmenityType = AmenityType = {}));
var CommuteOption;
(function (CommuteOption) {
    CommuteOption[CommuteOption["FIFTEEN"] = 15] = "FIFTEEN";
    CommuteOption[CommuteOption["THIRTY"] = 30] = "THIRTY";
    CommuteOption[CommuteOption["FORTY_FIVE"] = 45] = "FORTY_FIVE";
})(CommuteOption || (exports.CommuteOption = CommuteOption = {}));
var ScoreLevel;
(function (ScoreLevel) {
    ScoreLevel["EXCELLENT"] = "EXCELLENT";
    ScoreLevel["GOOD"] = "GOOD";
    ScoreLevel["FAIR"] = "FAIR";
    ScoreLevel["POOR"] = "POOR";
})(ScoreLevel || (exports.ScoreLevel = ScoreLevel = {}));
//# sourceMappingURL=index.js.map