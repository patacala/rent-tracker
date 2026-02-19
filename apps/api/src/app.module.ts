import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from './infrastructure/prisma/prisma.service';
import { SupabaseService } from './infrastructure/supabase/supabase.service';
import { JwtStrategy } from './infrastructure/auth/jwt.strategy';
import { AuthService } from './application/auth/auth.service';
import { OnboardingService } from './application/onboarding/onboarding.service';
import { AuthController } from './presentation/auth/auth.controller';
import { OnboardingController } from './presentation/onboarding/onboarding.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule,
  ],
  providers: [
    PrismaService,
    SupabaseService,
    JwtStrategy,
    AuthService,
    OnboardingService,
  ],
  controllers: [
    AuthController,
    OnboardingController,
  ],
})
export class AppModule {}