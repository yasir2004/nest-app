// src/auth/clerk.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { jwtVerify, createRemoteJWKSet } from 'jose';

@Injectable()
export class ClerkGuard implements CanActivate {
  private JWKS = createRemoteJWKSet(
    new URL(process.env.CLERK_JWKS_URL as string),
  );
  private ISSUER = process.env.CLERK_ISSUER;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('No Authorization header');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('No Bearer token');
    }

    try {
      const { payload } = await jwtVerify(token, this.JWKS, {
        issuer: this.ISSUER,
      });

      // Attach user to request for controllers
      request.user = payload;
      return true;
    } catch (err) {
      console.error('JWT verification failed:', err);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
