import {
  Body,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';

import { CreateEmployeeDto } from './dtos/create-employee.dto';

import { PrismaService } from 'src/database/prisma.service';

import { PrismaClientKnownRequestError } from 'src/database/generate/database/prisma/internal/prismaNamespace';
import { BcryptService } from 'src/shared/security/services/bcrypt.service';
import { Prisma, User } from 'src/database/generate/database/prisma/client';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { GetEmployeeQueryDto } from './dtos/get-employee-query.dto';
import { EmployeeResponseDto } from './dtos/employee-response.dto';

import { UpdateEmployeeDto } from './dtos/employee-update.dto.';

@Injectable()
export class EmployeeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bcryptService: BcryptService
  ) {}

  //Create Admin by super admin
  async registerAdmin(
    createEmployeeDto: CreateEmployeeDto
  ): Promise<EmployeeResponseDto> {
    const hashedPassword = await this.bcryptService.hash(
      createEmployeeDto.password
    );

    try {
      const user = await this.prisma.user.create({
        data: {
          ...createEmployeeDto,
          password: hashedPassword
        }
      });
      return user;
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
  async findByEmail(email: string): Promise<User | null> {
    console.log('FIND EMAIL:', email);

    const user = await this.prisma.user.findUnique({
      where: { email }
    });

    console.log('FOUND USER:', user);

    return user;
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

  // Get all employee and implement search page liit filter(role status level)
  async getAllEmployees(query: GetEmployeeQueryDto): Promise<{
    employees: EmployeeResponseDto[];
    meta: {
      total: number;
      page: number;
      limit: number;
    };
  }> {
    const {
      search,
      role,
      status,
      position,
      level,
      page = 1,
      limit = 10
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        {
          firstName: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          lastName: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          email: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    if (role) {
      where.roleType = role;
    }

    if (status) {
      where.status = status;
    }

    if (position) {
      where.position = position;
    }

    if (level) {
      where.level = level;
    }

    const [employees, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.user.count({ where })
    ]);

    return {
      employees: employees,
      meta: {
        total,
        page,
        limit
      }
    };
  }
  //getEmployeeDetail
  async getEmployeeDetail(id: string): Promise<EmployeeResponseDto> {
    const employee = await this.prisma.user.findUnique({
      where: { id }
    });
    if (!employee)
      throw new NotFoundException({
        message: 'Employee not found',
        code: 'EMPLOYEE_NOT_FOUND'
      });
    return employee;
  }

  async getEmployeeProfile(id: string): Promise<EmployeeResponseDto> {
    const employee = await this.prisma.user.findUnique({
      where: { id }
    });
    if (!employee)
      throw new NotFoundException({
        message: 'Employee not found',
        code: 'EMPLOYEE_NOT_FOUND'
      });
    return employee;
  }

  //Admin Update employee
  async updateEmployee(
    employeeId: string,
    updateEmployeeDto: UpdateEmployeeDto
  ): Promise<EmployeeResponseDto> {
    const employee = await this.prisma.user.update({
      where: { id: employeeId },
      data: updateEmployeeDto
    });
    if (!employee)
      throw new NotFoundException({
        message: 'Employee not found',
        code: 'EMPLOYEE_NOT_FOUND'
      });
    return employee;
  }

  //Admin Delete Employee
  async deleteEmployee(id: string): Promise<void> {
    const employee = await this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null
      }
    });
    if (!employee)
      throw new NotFoundException({
        message: 'Employee not found',
        code: 'EMPLOYEE_NOT_FOUND'
      });
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
}
