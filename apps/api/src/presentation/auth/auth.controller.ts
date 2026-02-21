import { Controller, Post, UseGuards, Request, Body, Patch } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../../application/auth/auth.service';
import { SupabaseService } from '../../infrastructure/supabase/supabase.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private supabaseService: SupabaseService,
  ) {}

  @Post('sync')
  @UseGuards(AuthGuard('jwt'))
  async sync(@Request() req: any) {
    const supabaseUser = await this.supabaseService.verifyToken(
      req.headers.authorization.replace('Bearer ', ''),
    );
    if (!supabaseUser) {
      return { error: 'Invalid token' };
    }
    const user = await this.authService.syncUser(supabaseUser);
    return { user };
  }

  @Post('check-email')
  async checkEmail(@Body() body: { email: string }) {
    const exists = await this.authService.emailExists(body.email);
    return { exists };
  }

  @Patch('profile')
  @UseGuards(AuthGuard('jwt'))
  async updateProfile(@Request() req: any, @Body() body: { name: string }) {
    return this.authService.updateProfile(req.user.id, body.name);
  }
}