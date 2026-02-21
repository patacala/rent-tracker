import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Like JwtAuthGuard but never rejects.
 * If a valid Bearer token is present it populates req.user;
 * if there is no token (or it is invalid) it sets req.user = null and lets the
 * request through anyway.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      await super.canActivate(context);
    } catch {
      // No token or invalid token — that is fine for optional auth
      const request = context.switchToHttp().getRequest();
      request.user = null;
    }
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleRequest(_err: any, user: any): any {
    return user ?? null;
  }
}
