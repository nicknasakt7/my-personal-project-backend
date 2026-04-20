import {
  Body,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';

import { CreateEmployeeDto } from './dtos/create-employee.dto';

import { PrismaService } from 'src/database/prisma.service';

import { PrismaClientKnownRequestError } from 'src/database/generate/database/prisma/internal/prismaNamespace';
import { BcryptService } from 'src/shared/security/services/bcrypt.service';
import {
  PositionName,
  Prisma,
  RoleType,
  User
} from 'src/database/generate/database/prisma/client';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { GetEmployeeQueryDto } from './dtos/get-employee-query.dto';
import { EmployeeResponseDto } from './dtos/employee-response.dto';

import { UpdateEmployeeDto } from './dtos/employee-update.dto.';
import { CloudinaryService } from 'src/shared/upload/cloudinary.service';

@Injectable()
export class EmployeeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bcryptService: BcryptService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  async createEmployee(
    role: RoleType,
    createEmployeeDto: CreateEmployeeDto
  ): Promise<EmployeeResponseDto> {
    const roleType = createEmployeeDto.roleType ?? RoleType.EMPLOYEE;
    const { position } = createEmployeeDto;

    const EMPLOYEE_POSITIONS: PositionName[] = [
      PositionName.FRONTEND_DEVELOPER,
      PositionName.BACKEND_DEVELOPER,
      PositionName.FULLSTACK_DEVELOPER,
      PositionName.DEVOPT_ENGINEERING,
      PositionName.QA_ENGINEER,
      PositionName.QA_AUTOMATE_ENGINEER,
      PositionName.SOFTWARE_TESTER,
      PositionName.UX_DESIGNER,
      PositionName.UI_DESIGNER,
      PositionName.SYSTEM_ADMINISTRATOR,
      PositionName.CLOUD_ENGINEERING,
      PositionName.DATABASE_ADMINISTRATOR
    ];

    if (roleType === RoleType.ADMIN) {
      if (role !== RoleType.SUPER_ADMIN) {
        throw new ForbiddenException('Only SUPER_ADMIN can create ADMIN');
      }
    }

    if (roleType === RoleType.EMPLOYEE) {
      if (!EMPLOYEE_POSITIONS.includes(position)) {
        throw new ForbiddenException({
          message: 'EMPLOYEE position must be following...'
        });
      }
    }
    const hashedPassword = await this.bcryptService.hash(
      createEmployeeDto.password
    );

    try {
      const user = await this.prisma.user.create({
        data: {
          ...createEmployeeDto,
          roleType,
          password: hashedPassword
        }
      });
      return user;
    } catch (error) {
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

  //Create Admin by super admin
  async registerAdmin(
    role: RoleType,
    createEmployeeDto: CreateEmployeeDto
  ): Promise<EmployeeResponseDto> {
    const { roleType, position } = createEmployeeDto;

    const ADMIN_POSITIONS: PositionName[] = [
      PositionName.ENGINEERING_MANAGER,
      PositionName.PRODUCT_MANAGER,
      PositionName.PROJECT_MANAGER,
      PositionName.SCRUM_MASTER
    ];

    // SUPER_ADMIN เท่านั้นสร้าง ADMIN ได้
    if (roleType === RoleType.ADMIN) {
      if (role !== RoleType.SUPER_ADMIN) {
        throw new ForbiddenException('Only SUPER_ADMIN can create ADMIN');
      }
      if (!ADMIN_POSITIONS.includes(position)) {
        throw new ForbiddenException({
          message: 'ADMIN position must be manager or scrum masster'
        });
      }
    }

    // ADMIN เท่านั้นสร้าง EMPLOYEE ได้
    if (roleType === RoleType.EMPLOYEE && role !== RoleType.ADMIN) {
      throw new ForbiddenException('Only ADMIN can create EMPLOYEE');
    }

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
    const user = await this.prisma.user.findUnique({
      where: { email }
    });

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

    const where: Prisma.UserWhereInput = { deletedAt: null };

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
  async getEmployeeSummary(id: string): Promise<{
    employee: EmployeeResponseDto;
    taskStats: {
      total: number;
      done: number;
      inProgress: number;
      inReview: number;
      todo: number;
      overdue: number;
      completionRate: number;
    };
    projects: {
      id: string;
      title: string;
      status: string;
      totalTasks: number;
      doneTasks: number;
    }[];
  }> {
    const employee = await this.prisma.user.findUnique({ where: { id } });
    if (!employee)
      throw new NotFoundException({ message: 'Employee not found', code: 'EMPLOYEE_NOT_FOUND' });

    const [total, done, inProgress, inReview, todo, overdue] = await Promise.all([
      this.prisma.task.count({ where: { assignToId: id, deletedAt: null } }),
      this.prisma.task.count({ where: { assignToId: id, deletedAt: null, status: 'DONE' } }),
      this.prisma.task.count({ where: { assignToId: id, deletedAt: null, status: 'IN_PROGRESS' } }),
      this.prisma.task.count({ where: { assignToId: id, deletedAt: null, status: 'IN_REVIEW' } }),
      this.prisma.task.count({ where: { assignToId: id, deletedAt: null, status: 'TODO' } }),
      this.prisma.task.count({ where: { assignToId: id, deletedAt: null, status: 'OVERDUE' } }),
    ]);

    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

    const memberProjects = await this.prisma.projectMember.findMany({
      where: { userId: id },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true,
            tasks: {
              where: { deletedAt: null },
              select: { status: true },
            },
          },
        },
      },
    });

    const projects = memberProjects.map(({ project }) => {
      const totalTasks = project.tasks.length;
      const doneTasks = project.tasks.filter(t => t.status === 'DONE').length;
      return {
        id: project.id,
        title: project.title,
        status: project.status,
        totalTasks,
        doneTasks,
      };
    });

    return { employee, taskStats: { total, done, inProgress, inReview, todo, overdue, completionRate }, projects };
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

  async uploadAvatar(
    currentUserId: string,
    role: RoleType,
    file: Express.Multer.File
  ): Promise<string> {
    const employee = await this.prisma.user.findFirst({
      where: { id: currentUserId, deletedAt: null }
    });

    if (!employee) {
      throw new NotFoundException({
        message: 'Employee not found',
        code: 'EMPLOYEE_NOT_FOUND'
      });
    }
    if (employee?.profileImagePublicId) {
      await this.cloudinaryService.delete(employee.profileImagePublicId);
    }
    const result = await this.cloudinaryService.upload(file);

    await this.updateEmployee(currentUserId, {
      profileImageUrl: result.secure_url,
      profileImagePublicId: result.public_id
    });
    return result.secure_url;
  }

  async uploadAvatarByAdmin(
    employeeId: string,
    file: Express.Multer.File
  ): Promise<string> {
    const employee = await this.prisma.user.findFirst({
      where: { id: employeeId, deletedAt: null }
    });
    if (!employee)
      throw new NotFoundException({ message: 'Employee not found', code: 'EMPLOYEE_NOT_FOUND' });

    if (employee.profileImagePublicId) {
      await this.cloudinaryService.delete(employee.profileImagePublicId);
    }
    const result = await this.cloudinaryService.upload(file);
    await this.updateEmployee(employeeId, {
      profileImageUrl: result.secure_url,
      profileImagePublicId: result.public_id
    });
    return result.secure_url;
  }

  //Admin Update employee
  async updateEmployee(
    employeeId: string,
    updateEmployeeDto: UpdateEmployeeDto,
    callerRole?: RoleType
  ): Promise<EmployeeResponseDto> {
    const target = await this.prisma.user.findUnique({ where: { id: employeeId } });
    if (!target)
      throw new NotFoundException({
        message: 'Employee not found',
        code: 'EMPLOYEE_NOT_FOUND'
      });

    if (callerRole === RoleType.ADMIN && target.roleType !== RoleType.EMPLOYEE) {
      throw new ForbiddenException('ADMIN can only edit EMPLOYEE profiles');
    }

    return this.prisma.user.update({
      where: { id: employeeId },
      data: updateEmployeeDto
    });
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
