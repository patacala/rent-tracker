import 'dotenv/config';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private prisma: PrismaClient;

  constructor() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    const adapter = new PrismaPg(pool);
    this.prisma = new PrismaClient({ adapter });
  }

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  get user() { return this.prisma.user; }
  get onboardingProfile() { return this.prisma.onboardingProfile; }
  get neighborhood() { return this.prisma.neighborhood; }
  get pOI() { return this.prisma.pOI; }
  get searchSession() { return this.prisma.searchSession; }
  get favoriteNeighborhood() { return this.prisma.favoriteNeighborhood; }
  get neighborhoodSafety() { return this.prisma.neighborhoodSafety; }
}