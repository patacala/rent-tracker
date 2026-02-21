import { Injectable } from '@nestjs/common';
import { GeoJSON } from 'geojson';
import type {
  IMapboxService,
  IsochroneParams,
  IsochroneResult,
  BoundaryFeature,
  POIFeature,
} from '../../../domain/services/external-services.interface';
import { MapboxService } from '../mapbox/mapbox.service';
import { OsmService } from '../osm/osm.service';
import type { POICategory } from '../../../domain/entities/poi.entity';

/**
 * GeoService — composite implementation of IMapboxService.
 *
 * Responsibility split:
 *   • getIsochrone   → Mapbox Isochrone API  (free plan, works fine)
 *   • searchBoundaries → Overpass / OSM API  (replaces enterprise Boundaries API)
 *   • searchPOIs       → Overpass / OSM API  (replaces enterprise Tilequery API)
 *
 * Bound to the MAPBOX_SERVICE injection token so no use-case code changes.
 */
@Injectable()
export class GeoService implements IMapboxService {
  constructor(
    private readonly mapboxService: MapboxService,
    private readonly osmService: OsmService,
  ) {}

  getIsochrone(params: IsochroneParams): Promise<IsochroneResult> {
    return this.mapboxService.getIsochrone(params);
  }

  searchBoundaries(polygon: GeoJSON.Polygon): Promise<BoundaryFeature[]> {
    return this.osmService.searchBoundaries(polygon);
  }

  searchPOIs(params: {
    boundary: GeoJSON.Polygon;
    categories: POICategory[];
  }): Promise<POIFeature[]> {
    return this.osmService.searchPOIs(params);
  }

  searchPOIsForArea(params: {
    polygon: GeoJSON.Polygon;
    categories: POICategory[];
  }): Promise<POIFeature[]> {
    return this.osmService.searchPOIsForArea(params);
  }
}
