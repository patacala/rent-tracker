import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { SupabaseService } from '../supabase/supabase.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private supabase: SupabaseService,
    private prisma: PrismaService,
  ) {
    super();
  }

  async validate(req: any) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) throw new UnauthorizedException();

    const token = authHeader.replace('Bearer ', '');
    const supabaseUser = await this.supabase.verifyToken(token);
    if (!supabaseUser) throw new UnauthorizedException();

    const user = await this.prisma.user.upsert({
      where: { supabaseId: supabaseUser.id },
      update: { email: supabaseUser.email ?? '' },
      create: {
        supabaseId: supabaseUser.id,
        email: supabaseUser.email ?? '',
        name: supabaseUser.user_metadata?.full_name,
      },
    });

    return user;
  }
}