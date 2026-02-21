import { Injectable, Inject } from '@nestjs/common';
import { GeoJSON } from 'geojson';
import { MAPBOX_SERVICE, type IMapboxService } from '../../domain/services/external-services.interface';

export interface GetIsochroneInput {
  longitude: number;
  latitude: number;
  timeMinutes: number;
  mode: 'driving' | 'walking' | 'cycling';
}

export interface GetIsochroneOutput {
  polygon: GeoJSON.Polygon;
}

@Injectable()
export class GetIsochroneUseCase {
  constructor(
    @Inject(MAPBOX_SERVICE)
    private readonly mapboxService: IMapboxService,
  ) {}

  async execute(input: GetIsochroneInput): Promise<GetIsochroneOutput> {
    const result = await this.mapboxService.getIsochrone({
      ...input,
      mode: input.mode === 'cycling' ? 'cycling' : input.mode,
    });

    return { polygon: result.polygon };
  }
}
