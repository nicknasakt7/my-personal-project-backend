import { RoleType } from 'src/database/generate/database/prisma/enums';

export type JwtPayload = {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
  roleType: RoleType;
};
