// ─────────────────────────────────────────────
// Relocation Intelligence — Shared Types
// Used by both backend (NestJS) and frontend (Expo)
// ─────────────────────────────────────────────
// ─── Enums ─────────────────────────────────
export var AmenityType;
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
})(AmenityType || (AmenityType = {}));
export var CommuteOption;
(function (CommuteOption) {
    CommuteOption[CommuteOption["FIFTEEN"] = 15] = "FIFTEEN";
    CommuteOption[CommuteOption["THIRTY"] = 30] = "THIRTY";
    CommuteOption[CommuteOption["FORTY_FIVE"] = 45] = "FORTY_FIVE";
})(CommuteOption || (CommuteOption = {}));
export var ScoreLevel;
(function (ScoreLevel) {
    ScoreLevel["EXCELLENT"] = "EXCELLENT";
    ScoreLevel["GOOD"] = "GOOD";
    ScoreLevel["FAIR"] = "FAIR";
    ScoreLevel["POOR"] = "POOR";
})(ScoreLevel || (ScoreLevel = {}));
//# sourceMappingURL=index.js.map