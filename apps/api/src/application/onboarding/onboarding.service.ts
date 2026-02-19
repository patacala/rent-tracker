import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { SaveOnboardingDto } from '../../presentation/onboarding/dto/save-onboarding.dto';

@Injectable()
export class OnboardingService {
  constructor(private prisma: PrismaService) {}

  async save(userId: string, dto: SaveOnboardingDto) {
    const existing = await this.prisma.onboardingProfile.findUnique({
      where: { userId },
    });

    if (existing) {
      return { skipped: true, message: 'Onboarding already exists' };
    }

    return this.prisma.onboardingProfile.create({
      data: { userId, ...dto },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.onboardingProfile.findUnique({
      where: { userId },
    });
  }
}