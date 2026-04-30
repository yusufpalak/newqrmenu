import { Role } from '../enums/role.enum';

export interface IJwtPayload {
  sub: string;
  email: string;
  role: Role;
  tenantId: string | null;
  iat?: number;
  exp?: number;
}

export interface IAuthenticatedUser {
  userId: string;
  email: string;
  role: Role;
  tenantId: string | null;
}
