import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaUserRepository } from './repositories/prisma-user.repository';
import { PrismaUserPreferencesRepository } from './repositories/prisma-user-preferences.repository';
import { PrismaSearchSessionRepository } from './repositories/prisma-search-session.repository';
import { MockPlacesService } from './external/places/mock-places.service';
import { MockDistanceService } from './external/distance/mock-distance.service';
import {
  USER_REPOSITORY,
  USER_PREFERENCES_REPOSITORY,
  SEARCH_SESSION_REPOSITORY,
} from '@domain/repositories';
import { PLACES_SERVICE, DISTANCE_SERVICE } from '@domain/services/external-services.interface';

@Module({
  imports: [PrismaModule],
  providers: [
    // Repository bindings
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: USER_PREFERENCES_REPOSITORY, useClass: PrismaUserPreferencesRepository },
    { provide: SEARCH_SESSION_REPOSITORY, useClass: PrismaSearchSessionRepository },
    // External service bindings (swap these for real implementations later)
    { provide: PLACES_SERVICE, useClass: MockPlacesService },
    { provide: DISTANCE_SERVICE, useClass: MockDistanceService },
    // Direct services needed by repositories
    PrismaService,
  ],
  exports: [
    USER_REPOSITORY,
    USER_PREFERENCES_REPOSITORY,
    SEARCH_SESSION_REPOSITORY,
    PLACES_SERVICE,
    DISTANCE_SERVICE,
  ],
})
export class InfrastructureModule {}
