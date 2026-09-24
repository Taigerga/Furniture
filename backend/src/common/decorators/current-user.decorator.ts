import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface JwtUser {
  sub: string;
  email: string;
  role: 'ADMIN' | 'WORKER';
  name?: string | null;
}

/** Ambil user dari request (hasil JwtStrategy.validate). */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtUser => {
    const req = ctx.switchToHttp().getRequest();
    return req.user as JwtUser;
  },
);
