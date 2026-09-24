import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { JwtUser } from '../../common/decorators/current-user.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  /** Rate limit menyamai proteksi lama: 10x / 10 menit per IP */
  @Throttle({ default: { limit: 10, ttl: 600_000, blockDuration: 600_000 } })
  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: JwtUser) {
    return this.auth.me(user.sub);
  }
}
