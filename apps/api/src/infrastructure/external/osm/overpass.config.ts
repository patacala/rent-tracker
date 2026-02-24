import type { POICategory } from '../../../domain/entities/poi.entity';

/**
 * Configuration for the Overpass API (OpenStreetMap).
 * No API key required — completely free.
 *
 * Mirror rotation strategy: if the primary server (overpass-api.de) returns
 * a 429 or 5xx, the service retries sequentially through the mirrors list.
 */
export const OVERPASS_CONFIG = {
  /** Primary server + mirrors tried in order on failure */
  mirrors: [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  ],

  /** [timeout:N] inside the Overpass QL query — server-side processing limit */
  timeoutSeconds: 60,

  /** HTTP connection timeout — must be > timeoutSeconds to allow the server to respond */
  timeoutMs: 70_000,

  /**
   * 64 MB server-side response limit.
   * Prevents the server from aborting large result sets mid-stream.
   */
  maxsizeBytes: 67_108_864,

  /**
   * Maps each POICategory to a single consolidated Overpass tag expression.
   * Using one filter per category (with regex unions) reduces the number of
   * query lines and lets Overpass optimise the full union in one pass.
   *
   * Format: the string following `node` in QL, e.g.
   *   '["amenity"~"^(school|university)$"]'
   *   →  node["amenity"~"^(school|university)$"]; inside the union
   */
  categoryFilters: {
    school:      ['["amenity"~"^(school|university|college|kindergarten)$"]'],
    park:        ['["leisure"~"^(park|garden|nature_reserve)$"]'],
    shop:        ['["shop"~"."]'],
    transit:     [
      '["highway"="bus_stop"]',
      '["railway"~"^(station|halt|tram_stop|subway_entrance)$"]',
    ],
    gym:         ['["leisure"~"^(fitness_centre|sports_centre|swimming_pool)$"]'],
    hospital:    ['["amenity"~"^(hospital|clinic|doctors|dentist|pharmacy)$"]'],
    restaurant:  ['["amenity"="restaurant"]'],
    bar:         ['["amenity"~"^(bar|pub|nightclub)$"]'],
    cafe:        ['["amenity"~"^(cafe|fast_food)$"]'],
    supermarket: ['["shop"~"^(supermarket|convenience)$"]'],
  } as Record<POICategory, string[]>,
} as const;
