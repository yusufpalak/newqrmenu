import {  Injectable, CanActivate, ExecutionContext, ForbiddenException, BadRequestException  } from '@nestjs/common';
import {  Reflector  } from '@nestjs/core';

@Injectable()export class TenantIsolationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context) {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Superadmin has access to all tenants
    if (user.role === 'SUPERADMIN') {
      return true;
    }

    // Check if tenantId is in params, query, or body
    const paramTenantId = request.params.tenantId;
    const bodyTenantId = request.body?.tenantId;

    // If accessing a specific tenant, verify it matches user's tenant
    if (paramTenantId && paramTenantId !== user.tenantId) {
      throw new ForbiddenException('Access denied: You can only access your own tenant data');
    }

    if (bodyTenantId && bodyTenantId !== user.tenantId) {
      throw new ForbiddenException('Access denied: You can only modify your own tenant data');
    }

    // Inject tenantId into request for service layer to use
    request.userTenantId = user.tenantId;

    return true;
  }
}
