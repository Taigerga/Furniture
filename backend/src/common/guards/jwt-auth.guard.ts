import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }

  override canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  override handleRequest<TUser = never>(err: unknown, user: unknown): TUser {
    if (err || !user) {
      throw err instanceof Error ? err : new UnauthorizedException('Token tidak valid atau kedaluwarsa.');
    }
    return user as TUser;
  }
}
