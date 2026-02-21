import { Controller, Post, Get, Patch, Delete, Body, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  async register(@Body() body: unknown) {
    const result = await this.authService.register(body);
    return {
      data: result,
      message: 'Inscription reussie',
    };
  }

  @Post('login')
  async login(@Body() body: unknown) {
    const result = await this.authService.login(body);
    return {
      data: result,
      message: 'Connexion reussie',
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser('id') userId: string) {
    const user = await this.authService.getMe(userId);
    return {
      data: user,
    };
  }

  @Post('complete-registration')
  @UseGuards(JwtAuthGuard)
  async completeRegistration(
    @CurrentUser('id') userId: string,
    @Body() body: {
      role?: string;
      organizationName?: string;
      organizationSiret?: string;
      organizationRna?: string;
      organizationAddress?: string;
    },
  ) {
    const result = await this.authService.completeRegistration(userId, body);
    return {
      data: result,
      message: 'Inscription completee',
    };
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() body: { firstName?: string; lastName?: string },
  ) {
    const user = await this.authService.updateProfile(userId, body);
    return {
      data: user,
      message: 'Profil mis a jour',
    };
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() body: { currentPassword?: string; newPassword: string },
  ) {
    const result = await this.authService.changePassword(userId, body);
    return {
      data: result,
      message: 'Mot de passe mis a jour',
    };
  }

  @Delete('account')
  @UseGuards(JwtAuthGuard)
  async deleteAccount(@CurrentUser('id') userId: string) {
    await this.authService.deleteAccount(userId);
    return {
      data: null,
      message: 'Compte supprime',
    };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {
    // Passport redirects to Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: any, @Res() res: Response) {
    const { user: profile } = req;
    const { token, isNew } = await this.authService.validateOrCreateGoogleUser(profile);
    const appUrl = this.configService.get<string>('NEXT_PUBLIC_APP_URL', 'http://localhost:3000');
    const params = new URLSearchParams({ token });
    if (isNew) params.set('new', '1');
    res.redirect(`${appUrl}/auth/callback?${params.toString()}`);
  }
}
