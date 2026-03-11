import {
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { CreateProjectDto } from './dtos/create-project.dto';
import { ProjectResponseDto } from './dtos/project-response.dto';
import { PrismaService } from 'src/database/prisma.service';
import { projectSelect } from './selects/project.select';
import { GetProjectsQueryDto } from './dtos/get-projects-query.dto';
import {
  Prisma,
  ProjectStatus,
  RoleType
} from 'src/database/generate/database/prisma/client';
import { UpdateProjectDto } from './dtos/update-project.dto';
import { ProjectStatsResponseDto } from './dtos/project-stat-response.dto';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  // Create Project by ADMIN / SUPER_ADMIN only
  async createProject(
    createProjectDto: CreateProjectDto,
    userId: string
  ): Promise<ProjectResponseDto> {
    const project = await this.prisma.project.create({
      data: {
        ...createProjectDto,
        createdById: userId,

        projectMembers: {
          create: {
            userId: userId,
            role: 'ADMIN'
          }
        }
      },
      select: projectSelect
    });
    return project;
  }

  //Get All Project and implement search page limit filter by
  // all ,Active, At Risk, Delayed,Completed,Canceled
  async getAllProjects(
    currentUserId: string,
    role: RoleType,
    query: GetProjectsQueryDto
  ): Promise<ProjectResponseDto[]> {
    const { month, year, search, status, createdBy } = query;

    const where: Prisma.ProjectWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive'
      };
    }

    if (createdBy === 'me') {
      where.createdById = currentUserId;
    }

    if (role === RoleType.EMPLOYEE) {
      where.projectMembers = {
        some: {
          userId: currentUserId
        }
      };
    }

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);

      where.createdAt = {
        gte: startDate,
        lt: endDate
      };
    }
    const projects = await this.prisma.project.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      select: projectSelect
    });
    return projects;
  }

  //get project stats card and calc
  async getProjectStats(): Promise<ProjectStatsResponseDto> {
    const [total, pending, completed, overdue] = await Promise.all([
      this.prisma.project.count(),
      this.prisma.project.count({
        where: { status: ProjectStatus.ACTIVE }
      }),
      this.prisma.project.count({
        where: { status: ProjectStatus.COMPLETED }
      }),
      this.prisma.project.count({
        where: {
          dueDate: { lt: new Date() },
          status: { not: ProjectStatus.COMPLETED }
        }
      })
    ]);
    return {
      total,
      pending,
      completed,
      overdue
    };
  }

  //Get project detail for all
  async getProjectDetail(
    currentUserId: string,
    role: RoleType,
    projectId: string
  ): Promise<ProjectResponseDto> {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, deletedAt: null },

      select: projectSelect
    });
    if (!project)
      throw new NotFoundException({
        message: 'Project not found',
        code: 'Project_NOT_FOUND'
      });
    if (role === RoleType.EMPLOYEE) {
      const isMember = project.projectMembers.some(
        (m) => m.userId === currentUserId
      );

      if (!isMember) {
        throw new ForbiddenException({
          message: 'Access denied',
          code: 'ACCESS_DENIED'
        });
      }
    }
    return project;
  }

  //Update project for admin
  async updateProject(
    currentUserId: string,
    projectId: string,
    updateProjectDto: UpdateProjectDto
  ): Promise<ProjectResponseDto> {
    const project = await this.prisma.project.update({
      where: { id: projectId, deletedAt: null },
      data: updateProjectDto,
      select: projectSelect
    });
    if (project.createdById !== currentUserId) {
      throw new ForbiddenException();
    }
    return project;
  }

  //cancel project by admin
  async cancelProject(projectId: string): Promise<ProjectResponseDto> {
    const project = await this.prisma.project.update({
      where: { id: projectId, deletedAt: null },
      data: {
        status: ProjectStatus.CANCELED
      },
      select: projectSelect
    });
    return project;
  }

  //delete project by admin
  async deleteProject(projectId: string): Promise<void> {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        deletedAt: null
      }
    });

    if (!project) {
      throw new NotFoundException({
        message: 'Project not found',
        code: 'Project_NOT_FOUND'
      });
    }

    await this.prisma.project.update({
      where: { id: projectId },
      data: {
        deletedAt: new Date()
      }
    });
  }

  // เอาไว้ให้ daีshboardเรียกใช้
  async getOverdueProjects() {
    return this.prisma.project.findMany({
      where: {
        dueDate: { lt: new Date() },
        status: { not: ProjectStatus.COMPLETED }
      },
      select: projectSelect
    });
  }
}
