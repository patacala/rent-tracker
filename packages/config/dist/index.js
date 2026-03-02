"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRIORITY_MATCH_CONFIG = exports.PRIORITY_TERM_TO_KEY = exports.PRIORITY_TO_POI_CATEGORIES = exports.COMMUTE_OPTIONS = exports.MIAMI_CONFIG = exports.API_CONFIG = exports.APP_CONFIG = void 0;
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
exports.COMMUTE_OPTIONS = [15, 30, 45, 60];
// ─── POI Category Mappings ───────────────────
exports.PRIORITY_TO_POI_CATEGORIES = {
    healthcare: ['hospital', 'medical'],
    dining: ['restaurant', 'bar', 'cafe'],
    schools: ['school'],
    parks: ['park'],
    shopping: ['shop', 'supermarket'],
    transit: ['transit', 'bus'],
    commute: ['transit'],
    safety: ['hospital', 'police'],
};
exports.PRIORITY_TERM_TO_KEY = {
    school: 'schools', schools: 'schools',
    park: 'parks', parks: 'parks',
    hospital: 'healthcare', medical: 'healthcare',
    healthcare: 'healthcare', health: 'healthcare',
    restaurant: 'dining', bar: 'dining', cafe: 'dining', dining: 'dining',
    shop: 'shopping', supermarket: 'shopping', shopping: 'shopping',
    transit: 'transit', bus: 'transit', commute: 'transit',
    safety: 'safety', police: 'safety',
};
exports.PRIORITY_MATCH_CONFIG = {
    healthcare: { base: 50, idealRatio: 0.10, minIdealCount: 2, weight: 1.3 },
    schools: { base: 50, idealRatio: 0.08, minIdealCount: 2, weight: 1.2 },
    safety: { base: 55, idealRatio: 0.08, minIdealCount: 2, weight: 1.3 },
    parks: { base: 45, idealRatio: 0.12, minIdealCount: 2, weight: 1.1 },
    transit: { base: 40, idealRatio: 0.15, minIdealCount: 3, weight: 1.0 },
    shopping: { base: 35, idealRatio: 0.18, minIdealCount: 3, weight: 0.9 },
    dining: { base: 35, idealRatio: 0.25, minIdealCount: 4, weight: 0.8 },
    default: { base: 40, idealRatio: 0.15, minIdealCount: 3, weight: 1.0 },
};
//# sourceMappingURL=index.js.map