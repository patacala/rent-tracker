import { Injectable, Logger } from '@nestjs/common';
import type { IDistanceService, RouteInfo } from '@domain/services/external-services.interface';
import type { Coordinates } from '@rent-tracker/types';
import { distanceKm } from '@rent-tracker/utils';

// ─── Mock Distance Service ────────────────────
// TODO: Replace with Google Distance Matrix API
// See: apps/api/src/infrastructure/external/distance/google-distance.service.ts (future)

@Injectable()
export class MockDistanceService implements IDistanceService {
  private readonly logger = new Logger(MockDistanceService.name);

  async calculate(params: {
    origin: Coordinates;
    destination: Coordinates;
    mode?: 'driving' | 'transit' | 'walking';
  }): Promise<RouteInfo> {
    this.logger.warn('[MOCK] calculate distance called — using haversine estimate');

    const km = distanceKm(
      params.origin.lat,
      params.origin.lng,
      params.destination.lat,
      params.destination.lng,
    );

    const avgSpeedKmh = params.mode === 'walking' ? 5 : params.mode === 'transit' ? 25 : 35;
    const durationMinutes = Math.round((km / avgSpeedKmh) * 60);

    return {
      distanceKm: km,
      durationMinutes,
      mode: params.mode ?? 'driving',
    };
  }
}
