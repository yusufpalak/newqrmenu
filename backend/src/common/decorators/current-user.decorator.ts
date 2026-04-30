import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IAuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import { IAuthenticatedUser } from '../interfaces/jwt-payload.interface';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): IAuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest<IAuthenticatedRequest>();
    return request.user;
  },
);
