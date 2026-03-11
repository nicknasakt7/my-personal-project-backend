import { SetMetadata } from '@nestjs/common';
import { RoleType } from 'src/database/generate/database/prisma/enums';

export const ROLES = Symbol('Roles');
export const Roles = (...roles: RoleType[]) => SetMetadata(ROLES, roles);
