import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post
} from '@nestjs/common';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CreateTaskDto } from './dtos/create-task.dto';
import { TaskService } from './task.service';
import type { JwtPayload } from 'src/auth/types/jwt-payload.type';

import { UpdateTaskDto } from './dtos/update-task.dto';
import { ResponseTaskDto } from './dtos/response-task.dto';
import { CurrentUserRole } from 'src/auth/decorators/current-user-role.decorator';
import { RoleType } from 'src/database/generate/database/prisma/enums';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}
  @Post()
  async createTask(
    @CurrentUser() user: JwtPayload,
    @CurrentUserRole() role: RoleType,
    @Body() createTaskDto: CreateTaskDto
  ): Promise<ResponseTaskDto> {
    return this.taskService.createTask(user.sub, role, createTaskDto);
  }

  // @Get()
  // async getAllTasks(
  //   @CurrentUser() user: JwtPayload,
  //   @Query() query: GetTaskQueryDto
  // ): Promise<ResponseTaskDto> {
  //   return this.taskService.getAllTasks(query);
  // }

  @Get(':id')
  async getTaskDetail(
    @CurrentUser() user: JwtPayload,
    @CurrentUserRole() role: RoleType,
    @Param('id') taskId: string
  ) {
    return this.taskService.getTaskDetail(user.sub, role, taskId);
  }

  @Patch(':id')
  async updateTask(
    @CurrentUser() user: JwtPayload,
    @CurrentUserRole() role: RoleType,
    @Param('id') taskId: string,
    @Body() updateTaskDto: UpdateTaskDto
  ) {
    return this.taskService.updateTask(user.sub, role, taskId, updateTaskDto);
  }

  @Patch(':id/status')
  async updateTaskStatus(
    @CurrentUser() user: JwtPayload,
    @CurrentUserRole() role: RoleType,
    @Param('id') taskId: string,
    @Body() updateTaskDto: UpdateTaskDto
  ): Promise<ResponseTaskDto> {
    return this.taskService.updateTaskStatus(
      user.sub,
      role,
      taskId,
      updateTaskDto
    );
  }

  @Delete(':id')
  async deleteTask(
    @CurrentUser() user: JwtPayload,
    @CurrentUserRole() role: RoleType,
    @Param('id') taskId: string
  ): Promise<void> {
    return this.taskService.deleteTask(user.sub, role, taskId);
  }

  @Get(':taskId/comments')
  async getCommentByTask() {}
}
