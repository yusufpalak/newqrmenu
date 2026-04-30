import { Request } from 'express';
import { IAuthenticatedUser } from './jwt-payload.interface';

export interface IAuthenticatedRequest extends Request {
  user: IAuthenticatedUser;
}
