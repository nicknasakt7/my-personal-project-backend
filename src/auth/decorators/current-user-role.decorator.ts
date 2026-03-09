import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { RoleType } from 'src/database/generate/database/prisma/enums';
import { JwtPayload } from '../types/jwt-payload.type';

export const CurrentUserRole = createParamDecorator(
  (data: keyof JwtPayload | undefined, context: ExecutionContext): RoleType => {
    const request = context.switchToHttp().getRequest<Request>();
    return request.user!.roleType;
  }
);
