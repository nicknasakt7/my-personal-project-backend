import { Injectable, NotFoundException } from '@nestjs/common';
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
    if (createdBy) {
      where.createdById = createdBy;
    }
    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive'
      };
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

  //Get project detail for all
  async getProjectDetail(projectId: string): Promise<ProjectResponseDto> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: projectSelect
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  //Update project for admin
  async updateProject(
    projectId: string,
    updateProjectDto: UpdateProjectDto
  ): Promise<ProjectResponseDto> {
    const project = await this.prisma.project.update({
      where: { id: projectId },
      data: updateProjectDto,
      select: projectSelect
    });
    return project;
  }

  //cancel project by admin
  async cancelProject(projectId: string): Promise<ProjectResponseDto> {
    const project = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        status: ProjectStatus.CANCELED
      },
      select: projectSelect
    });
    return project;
  }

  //delete project by admin
  async deleteProject(projectId: string): Promise<void> {
    await this.prisma.project.delete({
      where: { id: projectId }
    });
  }
}
