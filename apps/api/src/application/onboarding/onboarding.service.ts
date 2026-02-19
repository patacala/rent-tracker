import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { SaveOnboardingDto } from '../../presentation/onboarding/dto/save-onboarding.dto';

@Injectable()
export class OnboardingService {
  constructor(private prisma: PrismaService) {}

  async save(userId: string, dto: SaveOnboardingDto) {
    return this.prisma.onboardingProfile.upsert({
      where: { userId },
      update: { ...dto },
      create: { userId, ...dto },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.onboardingProfile.findUnique({
      where: { userId },
    });
  }
}