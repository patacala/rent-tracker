import { Injectable, Logger } from '@nestjs/common';
import type { IPlacesService, Place } from '@domain/services/external-services.interface';
import type { Coordinates } from '@rent-tracker/types';

// ─── Mock Places Service ──────────────────────
// TODO: Replace with Google Places API implementation
// See: apps/api/src/infrastructure/external/places/google-places.service.ts (future)

@Injectable()
export class MockPlacesService implements IPlacesService {
  private readonly logger = new Logger(MockPlacesService.name);

  async searchNearby(params: {
    location: Coordinates;
    radiusMeters: number;
    types: string[];
  }): Promise<Place[]> {
    this.logger.warn('[MOCK] searchNearby called — using mock data');

    return params.types.map((type, i) => ({
      placeId: `mock_place_${type}_${i}`,
      name: `Mock ${type} #${i + 1}`,
      type,
      location: {
        lat: params.location.lat + (Math.random() - 0.5) * 0.01,
        lng: params.location.lng + (Math.random() - 0.5) * 0.01,
      },
      rating: 3.5 + Math.random() * 1.5,
    }));
  }

  async getDetails(placeId: string): Promise<Place | null> {
    this.logger.warn('[MOCK] getDetails called — using mock data');

    return {
      placeId,
      name: `Mock Place ${placeId}`,
      type: 'establishment',
      location: { lat: 25.7617, lng: -80.1918 },
      rating: 4.2,
    };
  }
}
