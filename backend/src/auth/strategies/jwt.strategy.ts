import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import {
  IAuthenticatedUser,
  IJwtPayload,
} from '../../common/interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) throw new UnauthorizedException('JWT_SECRET not configured');
    const opts: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: true,
    };
    super(opts);
  }

  validate(req: any, payload: IJwtPayload): IAuthenticatedUser {
    if (!payload?.sub) throw new UnauthorizedException('Invalid token');
    let tenantId = payload.tenantId;
    if (payload.role === 'SUPERADMIN') {
      const headerTenantId = req.headers['x-tenant-id'] as string;
      if (headerTenantId) {
        tenantId = headerTenantId;
      }
    }
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      tenantId: tenantId,
    };
  }
}
