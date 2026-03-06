import { PrismaPg } from '@prisma/adapter-pg';
import {
  PrismaClient,
  RoleType
} from 'src/database/generate/database/prisma/client';
import bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const saltRounds = 10;
const main = async () => {
  await prisma.user.createMany({
    data: [
      {
        email: 'superadmin@gmail.com',
        password: await bcrypt.hash('admin123', saltRounds),
        roleType: RoleType.SUPER_ADMIN,
        firstName: 'Super',
        lastName: 'Admin',
        gender: 'OTHER',
        position: 'SYSTEM_ADMINISTRATOR'
      },
      {
        email: 'zuper@gmail.com',
        password: await bcrypt.hash('admin123', saltRounds),
        roleType: RoleType.SUPER_ADMIN,
        firstName: 'Zuper',
        lastName: 'Admin',
        gender: 'OTHER',
        position: 'SYSTEM_ADMINISTRATOR'
      }
    ]
  });
};

main().catch((error) => console.log(error));
