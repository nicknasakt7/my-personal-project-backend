import { ConflictException, Injectable } from '@nestjs/common';

import { CreateEmployeeDto } from './dtos/create-employee.dto';

import { PrismaService } from 'src/database/prisma.service';

import { PrismaClientKnownRequestError } from 'src/database/generate/database/prisma/internal/prismaNamespace';
import { BcryptService } from 'src/shared/security/services/bcrypt.service';
import { User } from 'src/database/generate/database/prisma/client';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bcryptService: BcryptService
  ) {}

  async registerAdmin(createEmployeeDto: CreateEmployeeDto): Promise<void> {
    const hashedPassword = await this.bcryptService.hash(
      createEmployeeDto.password
    );

    try {
      await this.prisma.user.create({
        data: {
          ...createEmployeeDto,
          password: hashedPassword
        }
      });
    } catch (error) {
      console.log('error', error);
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException({
          message: `Email ${createEmployeeDto.email} is already in use`,
          code: 'EMAIL_ALREADY_EXISTS'
        });
      }
      throw error;
    }
  }

  async findbyEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
