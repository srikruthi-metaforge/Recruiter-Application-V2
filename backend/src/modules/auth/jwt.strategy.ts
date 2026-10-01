import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string;
  userId: string;
  email: string;
  role: string;
  orgId: string;
  name?: string;
  permissions?: string[];
  iat?: number;
  exp?: number;
}

function cookieExtractor(req: { headers?: { cookie?: string } }): string | null {
  const header = req?.headers?.cookie;
  if (!header) return null;
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === 'access_token') return decodeURIComponent(rest.join('='));
  }
  return null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        cookieExtractor,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'super-secret-jwt-key-2026',
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload || !payload.sub || !payload.email) {
      throw new UnauthorizedException('Invalid JWT payload format');
    }
    return {
      id: payload.sub,
      userId: payload.userId || payload.sub,
      email: payload.email,
      role: payload.role,
      orgId: payload.orgId,
      name: payload.name,
      permissions: payload.permissions || [],
    };
  }
}
