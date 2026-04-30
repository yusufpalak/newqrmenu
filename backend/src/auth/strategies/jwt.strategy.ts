import {  Injectable, UnauthorizedException  } from '@nestjs/common';
import {  PassportStrategy  } from '@nestjs/passport';
import {  ExtractJwt, Strategy  } from 'passport-jwt';
import {  ConfigService  } from '@nestjs/config';

@Injectable()export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload) {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Invalid token');
    }

    // Ensure role exists in token
    if (!payload.role) {
      throw new UnauthorizedException('Invalid token: missing role');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      tenantId: payload.tenantId,
    };
  }
}
