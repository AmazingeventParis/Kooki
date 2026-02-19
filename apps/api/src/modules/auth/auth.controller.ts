import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
}
