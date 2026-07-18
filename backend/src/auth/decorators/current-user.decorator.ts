import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { AuthUser } from '../interfaces/auth-user.interface';

interface AuthenticatedRequest extends Request {
  user: AuthUser;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser => {
    return context.switchToHttp().getRequest<AuthenticatedRequest>().user;
  },
);
