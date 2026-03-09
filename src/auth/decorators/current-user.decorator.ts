import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../types/jwt-payload.type';
import { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, context: ExecutionContext) => {
    //แกะ request
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;
    if (!user)
      throw new Error('Current user cannot be used without authentication');

    return data ? user[data] : user;
  }
);
