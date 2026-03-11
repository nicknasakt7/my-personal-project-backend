import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { RoleType } from 'src/database/generate/database/prisma/enums';
import { ROLES } from '../decorators/roles-decorator';
import { Request } from 'express';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<RoleType[] | undefined>(
      ROLES,
      [context.getHandler(), context.getClass()]
    );

    if (!roles) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const userRole = request.user?.roleType;
    if (!userRole) throw new Error('Role cannot use without authentication');
    if (!roles.includes(userRole))
      throw new ForbiddenException(
        'Insufficien permission to perform this action'
      );
    return true;
  }
}
