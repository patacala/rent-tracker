export const MAPBOX_CONFIG = {
  baseUrl: 'https://api.mapbox.com',
  timeoutMs: 10000,
  maxRetries: 3,

  // API endpoints
  endpoints: {
    isochrone: (profile: string) => `/isochrone/v1/mapbox/${profile}`,
    tilequery: (tilesetId: string) => `/v4/${tilesetId}/tilequery`,
  },

  // Tilesets
  tilesets: {
    boundaries: 'mapbox.enterprise-boundaries-a0-v2',
    poi: 'mapbox.mapbox-streets-v8',
  },

  // POI category mapping (Mapbox → our categories)
  categoryMapping: {
    'education': 'school',
    'park': 'park',
    'shopping': 'shop',
    'transit_stop': 'transit',
    'fitness': 'gym',
    'hospital': 'hospital',
    'restaurant': 'restaurant',
    'bar': 'bar',
    'cafe': 'cafe',
    'supermarket': 'supermarket',
  },

  // Exclude these POI types
  excludeTypes: ['private_pool', 'residential'],
} as const;
