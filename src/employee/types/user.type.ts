import { User } from 'src/database/generate/database/prisma/client';

export type UserWithoutPassword = Omit<User, 'password'>;
