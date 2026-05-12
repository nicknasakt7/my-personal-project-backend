import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  SerializeOptions,
  UseInterceptors
} from '@nestjs/common';
import { CreateProjectDto } from './dtos/create-project.dto';
import { ProjectResponseDto } from './dtos/project-response.dto';
import { GetAllProjectsResponseDto } from './dtos/get-all-projects-response.dto';
import { ProjectService } from './project.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/types/jwt-payload.type';
import { GetProjectsQueryDto } from './dtos/get-projects-query.dto';
import { UpdateProjectDto } from './dtos/update-project.dto';
import { RoleType } from 'src/database/generate/database/prisma/enums';
import { CurrentUserRole } from 'src/auth/decorators/current-user-role.decorator';
import { Roles } from 'src/auth/decorators/roles-decorator';
import { ProjectStatsResponseDto } from './dtos/project-stat-response.dto';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: ProjectResponseDto, excludeExtraneousValues: true })
  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN')
  async createProject(
    @CurrentUser() user: JwtPayload,
    @Body() createProjectDto: CreateProjectDto
  ): Promise<ProjectResponseDto> {
    return this.projectService.createProject(createProjectDto, user.sub);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    type: GetAllProjectsResponseDto,
    excludeExtraneousValues: true
  })
  @Get()
  async getAllProjects(
    @CurrentUser() user: JwtPayload,
    @CurrentUserRole() role: RoleType,
    @Query() query: GetProjectsQueryDto
  ): Promise<GetAllProjectsResponseDto> {
    return this.projectService.getAllProjects(user.sub, role, query);
  }

  @Get('stat')
  async getProjectStats(): Promise<ProjectStatsResponseDto> {
    return this.projectService.getProjectStats();
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: ProjectResponseDto, excludeExtraneousValues: true })
  @Get(':id')
  async getProjectDetail(
    @CurrentUser() user: JwtPayload,
    @CurrentUserRole() role: RoleType,
    @Param('id', ParseUUIDPipe) projectId: string
  ): Promise<ProjectResponseDto> {
    return this.projectService.getProjectDetail(user.sub, role, projectId);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: ProjectResponseDto, excludeExtraneousValues: true })
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch(':projectId')
  async updateProject(
    @CurrentUser() user: JwtPayload,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() updateProjectDto: UpdateProjectDto
  ): Promise<ProjectResponseDto> {
    return this.projectService.updateProject(
      user.sub,
      projectId,
      updateProjectDto
    );
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: ProjectResponseDto, excludeExtraneousValues: true })
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch(':id/status')
  async cancelProject(
    @Param('id', ParseUUIDPipe) projectId: string
  ): Promise<ProjectResponseDto> {
    return this.projectService.cancelProject(projectId);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: ProjectResponseDto, excludeExtraneousValues: true })
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch(':id/restore')
  async restoreProject(
    @Param('id', ParseUUIDPipe) projectId: string
  ): Promise<ProjectResponseDto> {
    return this.projectService.restoreProject(projectId);
  }

  @Roles('SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteProject(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.projectService.deleteProject(id);
  }
}
