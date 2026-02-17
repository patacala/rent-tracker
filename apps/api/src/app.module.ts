import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { UsersController } from './presentation/controllers/users.controller';
import { PreferencesController } from './presentation/controllers/preferences.controller';
import { LifestyleScoreController } from './presentation/controllers/lifestyle-score.controller';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { SaveUserPreferencesUseCase } from './application/use-cases/save-user-preferences.use-case';
import { CalculateLifestyleScoreUseCase } from './application/use-cases/calculate-lifestyle-score.use-case';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    InfrastructureModule,
  ],
  controllers: [
    UsersController,
    PreferencesController,
    LifestyleScoreController,
  ],
  providers: [
    CreateUserUseCase,
    SaveUserPreferencesUseCase,
    CalculateLifestyleScoreUseCase,
  ],
})
export class AppModule {}
