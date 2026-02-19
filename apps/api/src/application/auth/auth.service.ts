import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

interface SupabaseUser {
  id: string;
  email?: string;
  user_metadata?: { full_name?: string };
}

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async syncUser(supabaseUser: SupabaseUser) {
    return this.prisma.user.upsert({
      where: { supabaseId: supabaseUser.id },
      update: {
        email: supabaseUser.email ?? '',
      },
      create: {
        supabaseId: supabaseUser.id,
        email: supabaseUser.email ?? '',
        name: supabaseUser.user_metadata?.full_name,
      },
    });
  }
}