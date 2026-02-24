import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { PrismaService } from './infrastructure/prisma/prisma.service';
import { SupabaseService } from './infrastructure/supabase/supabase.service';
import { JwtStrategy } from './infrastructure/auth/jwt.strategy';
import { AuthService } from './application/auth/auth.service';
import { OnboardingService } from './application/onboarding/onboarding.service';
import { GetIsochroneUseCase } from './application/use-cases/get-isochrone.use-case';
import { SearchNeighborhoodsUseCase } from './application/use-cases/search-neighborhoods.use-case';
import { GetNeighborhoodPOIsUseCase } from './application/use-cases/get-neighborhood-pois.use-case';
import { AnalyzeLocationUseCase } from './application/use-cases/analyze-location.use-case';
import { GetMyAnalysisUseCase } from './application/use-cases/get-my-analysis.use-case';
import { AuthController } from './presentation/auth/auth.controller';
import { OnboardingController } from './presentation/onboarding/onboarding.controller';
import { NeighborhoodsController } from './presentation/neighborhoods/neighborhoods.controller';
import { ToggleFavoriteUseCase } from '@application/use-cases/toggle-favorite.use-case';
import { GetFavoritesUseCase } from '@application/use-cases/get-favorites.use-case';
import { FavoritesController } from '@presentation/favorites/favorites.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule,
    InfrastructureModule,
  ],
  providers: [
    PrismaService,
    SupabaseService,
    JwtStrategy,
    AuthService,
    OnboardingService,
    // Use Cases
    GetIsochroneUseCase,
    SearchNeighborhoodsUseCase,
    GetNeighborhoodPOIsUseCase,
    AnalyzeLocationUseCase,
    GetMyAnalysisUseCase,
    ToggleFavoriteUseCase,
    GetFavoritesUseCase,
  ],
  controllers: [
    AuthController,
    OnboardingController,
    NeighborhoodsController,
    FavoritesController,
  ],
})
export class AppModule {}