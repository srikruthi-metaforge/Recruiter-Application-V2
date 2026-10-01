import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterRequestDto } from './dto/register-request.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

const COOKIE = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 8 * 60 * 60 * 1000,
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);
    res.cookie('access_token', result.accessToken, COOKIE);
    if (result.refreshToken) {
      res.cookie('refresh_token', result.refreshToken, { ...COOKIE, maxAge: 7 * 24 * 60 * 60 * 1000 });
    }
    return result;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Body() body: { refreshToken?: string } = {},
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.logout(body?.refreshToken);
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    return result;
  }

  @Post('register-request')
  @HttpCode(HttpStatus.CREATED)
  async registerRequest(@Body() dto: RegisterRequestDto) {
    return this.authService.registerRequest(dto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.refresh(dto);
    if (result?.accessToken) {
      res.cookie('access_token', result.accessToken, COOKIE);
    }
    return result;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: any) {
    return this.authService.getProfile(req.user);
  }
}
