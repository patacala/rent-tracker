import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaUserRepository } from './repositories/prisma-user.repository';
import { PrismaNeighborhoodRepository } from './repositories/prisma-neighborhood.repository';
import { PrismaPOIRepository } from './repositories/prisma-poi.repository';
import { PrismaSearchSessionRepository } from './repositories/prisma-search-session.repository';
import { MockPlacesService } from './external/places/mock-places.service';
import { MockDistanceService } from './external/distance/mock-distance.service';
import { MapboxService } from './external/mapbox/mapbox.service';
import { OsmService } from './external/osm/osm.service';
import { GeoService } from './external/geo/geo.service';
import {
  USER_REPOSITORY,
  NEIGHBORHOOD_REPOSITORY,
  POI_REPOSITORY,
  SEARCH_SESSION_REPOSITORY,
} from '@domain/repositories';
import { PLACES_SERVICE, DISTANCE_SERVICE, MAPBOX_SERVICE } from '@domain/services/external-services.interface';

@Module({
  imports: [PrismaModule, HttpModule],
  providers: [
    // Repository bindings
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: NEIGHBORHOOD_REPOSITORY, useClass: PrismaNeighborhoodRepository },
    { provide: POI_REPOSITORY, useClass: PrismaPOIRepository },
    { provide: SEARCH_SESSION_REPOSITORY, useClass: PrismaSearchSessionRepository },
    // External service bindings
    { provide: PLACES_SERVICE, useClass: MockPlacesService },
    { provide: DISTANCE_SERVICE, useClass: MockDistanceService },
    // Geo services: MapboxService (isochrone) + OsmService (boundaries/POIs)
    // GeoService is the composite bound to MAPBOX_SERVICE
    MapboxService,
    OsmService,
    { provide: MAPBOX_SERVICE, useClass: GeoService },
    // Direct services needed by repositories
    PrismaService,
  ],
  exports: [
    USER_REPOSITORY,
    NEIGHBORHOOD_REPOSITORY,
    POI_REPOSITORY,
    SEARCH_SESSION_REPOSITORY,
    PLACES_SERVICE,
    DISTANCE_SERVICE,
    MAPBOX_SERVICE,
  ],
})
export class InfrastructureModule {}
