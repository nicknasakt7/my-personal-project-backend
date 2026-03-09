import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query
} from '@nestjs/common';
import { CreateProjectDto } from './dtos/create-project.dto';

import { ProjectResponseDto } from './dtos/project-response.dto';
import { ProjectService } from './project.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/types/jwt-payload.type';
import { GetProjectsQueryDto } from './dtos/get-projects-query.dto';
import { UpdateProjectDto } from './dtos/update-project.dto';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}
  @Post()
  async createProject(
    @CurrentUser() user: JwtPayload,
    @Body() createProjectDto: CreateProjectDto
  ): Promise<ProjectResponseDto> {
    return this.projectService.createProject(createProjectDto, user.sub);
  }

  @Get()
  async getAllProjects(
    @Query() query: GetProjectsQueryDto
  ): Promise<ProjectResponseDto[]> {
    return this.projectService.getAllProjects(query);
  }

  @Get(':id')
  async getProductDetail(
    @Param('id') projectId: string
  ): Promise<ProjectResponseDto> {
    return this.projectService.getProjectDetail(projectId);
  }

  @Patch(':id')
  async updateProject(
    @Param('id') projectId: string,
    @Body() updateProjectDto: UpdateProjectDto
  ): Promise<ProjectResponseDto> {
    return this.projectService.updateProject(projectId, updateProjectDto);
  }

  @Patch(':id/status')
  async cancelProject(
    @Param('id') projectId: string
  ): Promise<ProjectResponseDto> {
    return this.projectService.cancelProject(projectId);
  }

  @Delete(':id')
  async deleteProject(@Param('id') projectId: string): Promise<void> {
    return this.projectService.deleteProject(projectId);
  }
}
