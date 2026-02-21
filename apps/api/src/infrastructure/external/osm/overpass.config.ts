import type { POICategory } from '../../../domain/entities/poi.entity';

/**
 * Configuration for the Overpass API (OpenStreetMap).
 * Uses the public Overpass instance — no API key required.
 *
 * Tag filter arrays are injected verbatim into Overpass QL as node-filter
 * expressions, e.g.  node["amenity"="school"](bbox);
 */
export const OVERPASS_CONFIG = {
  baseUrl: 'https://overpass-api.de/api/interpreter',
  timeoutSeconds: 25,
  timeoutMs: 30_000,

  /**
   * Maps each POICategory to one or more Overpass tag expressions.
   * Each string is the filter part that follows `node` in a query, e.g.
   *   '["amenity"~"school|university"]'  →  node["amenity"~"school|university"](bbox);
   */
  categoryFilters: {
    school:      ['["amenity"~"school|university|college|kindergarten"]'],
    park:        ['["leisure"~"park|garden|nature_reserve"]'],
    shop:        ['["shop"]'],
    transit:     [
      '["highway"="bus_stop"]',
      '["railway"~"station|halt|tram_stop|subway_entrance"]',
      '["amenity"~"bus_station|ferry_terminal"]',
    ],
    gym:         ['["leisure"~"fitness_centre|sports_centre|swimming_pool"]', '["amenity"="gym"]'],
    hospital:    ['["amenity"~"hospital|clinic|doctors|dentist|pharmacy"]'],
    restaurant:  ['["amenity"="restaurant"]'],
    bar:         ['["amenity"~"bar|pub|nightclub|biergarten"]'],
    cafe:        ['["amenity"~"cafe|fast_food|food_court"]'],
    supermarket: ['["shop"~"supermarket|grocery|convenience"]'],
  } as Record<POICategory, string[]>,
} as const;
