import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<T>(err: Error | null, user: T, info: Error | null, context: ExecutionContext): T {
    if (err || !user) {
      throw err || new UnauthorizedException('Token invalide ou expire');
    }
    return user;
  }
}
