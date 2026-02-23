"use strict";
// ─────────────────────────────────────────────
// Relocation Intelligence — Shared Config
// ─────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMMUTE_OPTIONS = exports.SCORE_WEIGHTS = exports.MIAMI_CONFIG = exports.API_CONFIG = exports.APP_CONFIG = void 0;
exports.APP_CONFIG = {
    name: 'Relocation Intelligence',
    version: '0.0.1',
    defaultCity: 'miami',
};
exports.API_CONFIG = {
    baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
    version: 'v1',
    timeout: 10000,
};
// Miami bounding box for MVP
exports.MIAMI_CONFIG = {
    center: { lat: 25.7617, lng: -80.1918 },
    defaultRegion: {
        lat: 25.7617,
        lng: -80.1918,
        latitudeDelta: 0.15,
        longitudeDelta: 0.15,
    },
    neighborhoods: [
        { id: 'brickell', name: 'Brickell', lat: 25.7593, lng: -80.1937 },
        { id: 'wynwood', name: 'Wynwood', lat: 25.8008, lng: -80.1995 },
        { id: 'coral-gables', name: 'Coral Gables', lat: 25.7215, lng: -80.2684 },
        { id: 'coconut-grove', name: 'Coconut Grove', lat: 25.7308, lng: -80.2394 },
        { id: 'little-havana', name: 'Little Havana', lat: 25.7697, lng: -80.2299 },
        { id: 'design-district', name: 'Design District', lat: 25.8124, lng: -80.1942 },
        { id: 'downtown', name: 'Downtown Miami', lat: 25.7749, lng: -80.1936 },
        { id: 'south-beach', name: 'South Beach', lat: 25.7825, lng: -80.1300 },
    ],
};
exports.SCORE_WEIGHTS = {
    commute: 0.4,
    amenities: 0.4,
    family: 0.2,
};
exports.COMMUTE_OPTIONS = [15, 30, 45];
//# sourceMappingURL=index.js.map