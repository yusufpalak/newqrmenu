import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Role } from '../../common/enums/role.enum';
import { IAuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';

@Injectable()
export class TenantIsolationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<IAuthenticatedRequest>();
    const user = request.user;
    if (!user) throw new ForbiddenException('User not authenticated');
    if (user.role === Role.SUPERADMIN) return true;

    const params = (request.params || {}) as Record<string, string>;
    const body = (request.body || {}) as Record<string, unknown>;
    const query = (request.query || {}) as Record<string, unknown>;

    const requestedTenantId =
      params.tenantId ||
      (typeof body.tenantId === 'string' ? body.tenantId : undefined) ||
      (typeof query.tenantId === 'string' ? query.tenantId : undefined);

    if (requestedTenantId && requestedTenantId !== user.tenantId) {
      throw new ForbiddenException('Tenant access denied');
    }
    return true;
  }
}
