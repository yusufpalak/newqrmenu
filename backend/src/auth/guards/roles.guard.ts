import {  Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException  } from '@nestjs/common';
import {  Reflector  } from '@nestjs/core';

@Injectable()export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context) {
    const requiredRoles = this.reflector.getAllAndOverride('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.role) {
      throw new UnauthorizedException('User role not found');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
