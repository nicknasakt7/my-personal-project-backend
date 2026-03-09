import {
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { ResponseTaskDto } from './dtos/response-task.dto';
import { CreateTaskDto } from './dtos/create-task.dto';

import {
  RoleType,
  TaskStatus
} from 'src/database/generate/database/prisma/enums';

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

  //CreateTaskbyAdmin
  async createTask(
    currentUserId: string,
    role: RoleType,
    createTaskDto: CreateTaskDto
  ): Promise<ResponseTaskDto> {
    let assignToId = createTaskDto.assignToId;

    if (role === RoleType.EMPLOYEE) {
      assignToId = currentUserId;
    }
    if (createTaskDto.isPersonal) {
      assignToId = currentUserId;
      createTaskDto.projectId = null;
    }

    const task = await this.prisma.task.create({
      data: {
        ...createTaskDto,
        assignToId,
        createdById: currentUserId
      }
    });
    return task;
  }

  async getAllTasks() {}

  async getTaskDetail() {}

  //UpdateTask
  async updateTask(
    currentUserId: string,
    role: RoleType,
    taskId: string,
    updateTaskDto: UpdateTaskDto
  ): Promise<ResponseTaskDto> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      throw new NotFoundException({
        message: 'Task not found',
        code: 'TASK_NOT_FOUND'
      });
    }

    if (role === RoleType.EMPLOYEE && task.assignToId !== currentUserId) {
      throw new UnauthorizedException({
        message: 'You cannot update this task',
        code: 'TASK_FORBIDDEN'
      });
    }

    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: updateTaskDto
    });

    return updatedTask;
  }

  //UpdateStatus
  async updateTaskStatus(
    currentUserId: string,
    role: RoleType,
    taskId: string,
    updateTaskDto: UpdateTaskDto
  ): Promise<ResponseTaskDto> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      throw new NotFoundException({
        message: 'Task not found',
        code: 'TASK_NOT_FOUND'
      });
    }

    if (role === RoleType.EMPLOYEE && task.assignToId !== currentUserId) {
      throw new UnauthorizedException({
        message: 'You cannot update this task',
        code: 'TASK_FORBIDDEN'
      });
    }
    if (
      role === RoleType.EMPLOYEE &&
      updateTaskDto.status === TaskStatus.DONE
    ) {
      throw new UnauthorizedException({
        message: 'Employee cannot set task to DONE',
        code: 'STATUS_NOT_ALLOWED'
      });
    }

    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        status: updateTaskDto.status
      }
    });

    return updatedTask;
  }

  //soft delete task
  async deleteTask(
    currentUserId: string,
    role: RoleType,
    taskId: string
  ): Promise<void> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId }
    });
    if (!task) {
      throw new NotFoundException({
        message: 'Task not found',
        code: 'TASK_NOT_FOUND'
      });
    }
    if (role === RoleType.EMPLOYEE && task.assignToId !== currentUserId) {
      throw new UnauthorizedException({
        message: 'You cannot delete this task',
        code: 'TASK_FORBIDDEN'
      });
    }
    await this.prisma.task.update({
      where: { id: taskId },
      data: {
        deletedAt: new Date()
      }
    });
  }

  async getOverDueTask() {}

  async getCommentByTask() {}
}
