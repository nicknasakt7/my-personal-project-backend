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

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CreateTaskDto } from './dtos/create-task.dto';
import { TaskService } from './task.service';
import type { JwtPayload } from 'src/auth/types/jwt-payload.type';

import { UpdateTaskDto } from './dtos/update-task.dto';
import { ResponseTaskDto } from './dtos/response-task.dto';
import { CurrentUserRole } from 'src/auth/decorators/current-user-role.decorator';
import { RoleType } from 'src/database/generate/database/prisma/enums';

import { CreateCommentDto } from 'src/comment/dtos/create-comment.dto';
import { GetCommentsQueryDto } from 'src/comment/dtos/get-comment-query.dto';
import { CommentPaginationDto } from 'src/comment/dtos/comment-pagination.dto';
import { CommentResponseDto } from 'src/comment/dtos/comment-response.dto';
import { GetTaskQueryDto } from './dtos/get-task-query.dto';
import { TaskListResponseDto } from './dtos/task-list-response.dto';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    type: ResponseTaskDto,
    excludeExtraneousValues: true
  })
  @Post()
  async createTask(
    @CurrentUser() user: JwtPayload,
    @CurrentUserRole() role: RoleType,
    @Body() createTaskDto: CreateTaskDto
  ): Promise<ResponseTaskDto> {
    return this.taskService.createTask(user.sub, role, createTaskDto);
  }

  @Get('summary')
  async getTaskSummary() {
    return this.taskService.getTaskSummary();
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: TaskListResponseDto, excludeExtraneousValues: true })
  @Get('personal')
  async getPersonalTasks(
    @CurrentUser() user: JwtPayload,
    @Query() query: GetTaskQueryDto
  ): Promise<TaskListResponseDto> {
    return this.taskService.getPersonalTasks(user.sub, query);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: TaskListResponseDto, excludeExtraneousValues: true })
  @Get('my')
  async getMyTasks(
    @CurrentUser() user: JwtPayload,
    @Query() query: GetTaskQueryDto
  ): Promise<TaskListResponseDto> {
    return this.taskService.getMyTasks(user.sub, query);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    type: TaskListResponseDto,
    excludeExtraneousValues: true
  })
  @Get()
  async getAllTasks(
    @Query() query: GetTaskQueryDto
  ): Promise<TaskListResponseDto> {
    return this.taskService.getAllTasks(query);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    type: ResponseTaskDto,
    excludeExtraneousValues: true
  })
  @Get(':id')
  async getTaskDetail(
    @CurrentUser() user: JwtPayload,
    @CurrentUserRole() role: RoleType,
    @Param('id', ParseUUIDPipe) taskId: string
  ): Promise<ResponseTaskDto> {
    return this.taskService.getTaskDetail(user.sub, role, taskId);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    type: ResponseTaskDto,
    excludeExtraneousValues: true
  })
  @Patch(':id')
  async updateTask(
    @CurrentUser() user: JwtPayload,
    @CurrentUserRole() role: RoleType,
    @Param('id', ParseUUIDPipe) taskId: string,
    @Body() updateTaskDto: UpdateTaskDto
  ): Promise<ResponseTaskDto> {
    return this.taskService.updateTask(user.sub, role, taskId, updateTaskDto);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    type: ResponseTaskDto,
    excludeExtraneousValues: true
  })
  @Patch(':id/status')
  async updateTaskStatus(
    @CurrentUser() user: JwtPayload,
    @CurrentUserRole() role: RoleType,
    @Param('id', ParseUUIDPipe) taskId: string,
    @Body() updateTaskDto: UpdateTaskDto
  ): Promise<ResponseTaskDto> {
    return this.taskService.updateTaskStatus(
      user.sub,
      role,
      taskId,
      updateTaskDto
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteTask(
    @CurrentUser() user: JwtPayload,
    @CurrentUserRole() role: RoleType,
    @Param('id', ParseUUIDPipe) taskId: string
  ): Promise<void> {
    return this.taskService.deleteTask(user.sub, role, taskId);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    type: CommentResponseDto,
    excludeExtraneousValues: true
  })
  @Post(':taskId/comments')
  async createComment(
    @CurrentUser() user: JwtPayload,
    @CurrentUserRole() role: RoleType,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() createCommentDto: CreateCommentDto
  ): Promise<CommentResponseDto> {
    return this.taskService.createComment(
      user.sub,
      role,
      taskId,
      createCommentDto
    );
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    type: CommentPaginationDto,
    excludeExtraneousValues: true
  })
  @Get(':taskId/comments')
  async getCommentByTask(
    @CurrentUser() user: JwtPayload,
    @CurrentUserRole() role: RoleType,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Query() query: GetCommentsQueryDto
  ): Promise<CommentPaginationDto> {
    return this.taskService.getCommentByTask(user.sub, role, taskId, query);
  }

  //   @Get(':taskId/detail')
  //   async getEmployeeDetail(@Param('taskId', ParseUUIDPipe) id: string): Promise<{
  //     employee: EmployeeResponseDto;
  //     stats: {
  //       total: number;
  //       todo: number;
  //       inprogress: number;
  //       done: number;
  //     };
  //     projects: ProjectResponseDto[];
  //     recentTasks: ResponseTaskDto[];
  //   }> {
  //     return this.employeeService.getEmployeeDetailPage(taskId);
  //   }
}
