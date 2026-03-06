import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';

import { CreateEmployeeDto } from './dtos/create-employee.dto';

import { PrismaService } from 'src/database/prisma.service';

import { PrismaClientKnownRequestError } from 'src/database/generate/database/prisma/internal/prismaNamespace';
import { BcryptService } from 'src/shared/security/services/bcrypt.service';
import { User } from 'src/database/generate/database/prisma/client';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { UserWithoutPassword } from './types/user.type';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bcryptService: BcryptService
  ) {}

  //Create Admin by super admin
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

  //Find by Email for login
  async findbyEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  //Change password
  async changePassword(
    userId: string,
    changpasswordDto: ChangePasswordDto
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) {
      throw new NotFoundException({
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    const isMatch = await this.bcryptService.compare(
      changpasswordDto.currentPassword,
      user.password
    );

    if (!isMatch) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await this.bcryptService.hash(
      changpasswordDto.newPassword
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });
  }

  async getAllEmployee(
    query: Record<string, string | undefined>
  ): Promise<User[]> {
    const users = await this.prisma.user.findMany();
    return users;
  }
}
