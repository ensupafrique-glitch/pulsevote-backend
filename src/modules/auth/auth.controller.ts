import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { RequestMagicLinkDto } from './dto/request-magic-link.dto';
import { VerifyMagicLinkDto } from './dto/verify-magic-link.dto';
import { StartPasskeyRegistrationDto } from './dto/start-passkey-registration.dto';
import { FinishPasskeyRegistrationDto } from './dto/finish-passkey-registration.dto';
import { StartPasskeyLoginDto } from './dto/start-passkey-login.dto';
import { FinishPasskeyLoginDto } from './dto/finish-passkey-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ short: { limit: 5, ttl: 60_000 }, medium: { limit: 20, ttl: 15 * 60_000 } })
  @Post('magic-link/request')
  requestMagicLink(@Body() dto: RequestMagicLinkDto) {
    return this.authService.requestMagicLink(dto);
  }

  @Throttle({ short: { limit: 10, ttl: 60_000 }, medium: { limit: 30, ttl: 15 * 60_000 } })
  @Get('magic-link/callback')
  verifyMagicLinkGet(@Query('token') token: string) {
    return this.authService.verifyMagicLink({ token });
  }

  @Throttle({ short: { limit: 10, ttl: 60_000 }, medium: { limit: 30, ttl: 15 * 60_000 } })
  @Post('magic-link/verify')
  verifyMagicLinkPost(@Body() dto: VerifyMagicLinkDto) {
    return this.authService.verifyMagicLink(dto);
  }

  @Throttle({ short: { limit: 5, ttl: 60_000 }, medium: { limit: 20, ttl: 15 * 60_000 } })
  @Post('passkey/register/options')
  startPasskeyRegistration(@Query('email') email: string, @Body() dto: StartPasskeyRegistrationDto) {
    return this.authService.startPasskeyRegistration(email, dto);
  }

  @Throttle({ short: { limit: 5, ttl: 60_000 }, medium: { limit: 20, ttl: 15 * 60_000 } })
  @Post('passkey/register/verify')
  finishPasskeyRegistration(@Body() dto: FinishPasskeyRegistrationDto) {
    return this.authService.finishPasskeyRegistration(dto);
  }

  @Throttle({ short: { limit: 10, ttl: 60_000 }, medium: { limit: 30, ttl: 15 * 60_000 } })
  @Post('passkey/login/options')
  startPasskeyLogin(@Body() dto: StartPasskeyLoginDto) {
    return this.authService.startPasskeyLogin(dto);
  }

  @Throttle({ short: { limit: 10, ttl: 60_000 }, medium: { limit: 30, ttl: 15 * 60_000 } })
  @Post('passkey/login/verify')
  finishPasskeyLogin(@Body() dto: FinishPasskeyLoginDto) {
    return this.authService.finishPasskeyLogin(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: unknown) {
    return user;
  }
}
