import {
  ForbiddenException,
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
import { taskDetailSelect } from './select/task-detail.select';
import { CommentResponseDto } from 'src/comment/dtos/comment-response.dto';
import { commentSelect } from 'src/comment/select/comment.select';
import { CreateCommentDto } from 'src/comment/dtos/create-comment.dto';
import { GetCommentsQueryDto } from 'src/comment/dtos/get-comment-query.dto';
import { GetTaskQueryDto } from './dtos/get-task-query.dto';
import { Prisma } from 'src/database/generate/database/prisma/client';
import { TaskListResponseDto } from './dtos/task-list-response.dto';
import { taskListSelect } from './select/task-list.select';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/database/generate/database/prisma/enums';

@Injectable()
export class TaskService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  //CreateTaskbyAdmin
  async createTask(
    currentUserId: string,
    role: RoleType,
    createTaskDto: CreateTaskDto
  ): Promise<ResponseTaskDto> {
    let assignToId = createTaskDto.assignToId;

    if (role === RoleType.ADMIN || role === RoleType.SUPER_ADMIN) {
      if (!assignToId) {
        throw new ForbiddenException({
          message: 'Admin must assign task to employee',
          code: 'TASK_ASSIGN_REQUIRED'
        });
      }
    }

    if (role === RoleType.EMPLOYEE) {
      if (!createTaskDto.isPersonal) {
        throw new ForbiddenException({
          message: 'Employee can only create personal tasks',
          code: 'EMPLOYEE_PERSONAL_TASK_ONLY'
        });
      }
      assignToId = currentUserId;
      createTaskDto.projectId = null;
    }

    const task = await this.prisma.task.create({
      data: {
        ...createTaskDto,
        assignToId,
        createdById: currentUserId
      },
      select: taskDetailSelect
    });
    if (assignToId && assignToId !== currentUserId) {
      this.notificationService.createNotification({
        userId: assignToId,
        type: NotificationType.TASK_ASSIGNED,
        title: 'New task assigned to you',
        body: `You have been assigned to "${task.title}"`,
        taskId: task.id,
      }).catch(() => {});
    }

    if (createTaskDto.projectId) {
      this.prisma.projectMember
        .upsert({
          where: {
            projectId_userId: {
              projectId: createTaskDto.projectId,
              userId: assignToId
            }
          },
          create: {
            projectId: createTaskDto.projectId,
            userId: assignToId
          },
          update: {}
        })
        .catch(console.error);
    }
    return task;
  }
  //get task statcard
  async getTaskSummary() {
    const [total, todo, inprogress, done] = await Promise.all([
      this.prisma.task.count(),
      this.prisma.task.count({
        where: { status: TaskStatus.TODO }
      }),
      this.prisma.task.count({
        where: { status: TaskStatus.IN_PROGRESS }
      }),
      this.prisma.task.count({
        where: { status: TaskStatus.DONE }
      })
    ]);
    return {
      total,
      todo,
      inprogress,
      done
    };
  }

  // personal tasks created by current user
  async getPersonalTasks(
    currentUserId: string,
    query: GetTaskQueryDto
  ): Promise<TaskListResponseDto> {
    const { search, page = 1, limit = 10, status, priority } = query;
    const safeLimit = Math.min(limit, 50);
    const skip = (page - 1) * safeLimit;

    const where: Prisma.TaskWhereInput = {
      deletedAt: null,
      isPersonal: true,
      createdById: currentUserId,
    };

    if (search) where.title = { contains: search, mode: 'insensitive' };
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy: { createdAt: 'desc' },
        select: taskListSelect
      }),
      this.prisma.task.count({ where })
    ]);

    return {
      tasks,
      meta: { total, page, limit, totalPages: Math.ceil(total / safeLimit) }
    };
  }

  // tasks assigned to current user
  async getMyTasks(
    currentUserId: string,
    query: GetTaskQueryDto
  ): Promise<TaskListResponseDto> {
    const { search, page = 1, limit = 10, status, priority } = query;
    const safeLimit = Math.min(limit, 50);
    const skip = (page - 1) * safeLimit;

    const where: Prisma.TaskWhereInput = {
      deletedAt: null,
      assignToId: currentUserId,
      isPersonal: false,
    };

    if (search) where.title = { contains: search, mode: 'insensitive' };
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy: { createdAt: 'desc' },
        select: taskListSelect
      }),
      this.prisma.task.count({ where })
    ]);

    return {
      tasks,
      meta: { total, page, limit, totalPages: Math.ceil(total / safeLimit) }
    };
  }

  //task list
  async getAllTasks(query: GetTaskQueryDto): Promise<TaskListResponseDto> {
    const { search, page = 1, limit = 10, status, priority, assignTo, projectId, createdBy } = query;

    const safeLimit = Math.min(limit, 50);
    const skip = (page - 1) * safeLimit;

    const where: Prisma.TaskWhereInput = {
      deletedAt: null
    };

    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive'
      };
    }
    if (status) {
      where.status = status;
    }
    if (priority) {
      where.priority = priority;
    }
    if (assignTo) {
      where.assignToId = assignTo;
    }
    if (projectId) {
      where.projectId = projectId;
    }
    if (createdBy) {
      where.createdById = createdBy;
      where.isPersonal = false;
    }

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy: {
          createdAt: 'desc'
        },
        select: taskListSelect
      }),
      this.prisma.task.count({ where })
    ]);

    return {
      tasks: tasks,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  //getTaskDetail by admin and employee only own task
  async getTaskDetail(
    currentUserId: string,
    role: RoleType,
    taskId: string
  ): Promise<ResponseTaskDto> {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, deletedAt: null },
      select: taskDetailSelect
    });

    if (!task) {
      throw new NotFoundException({
        message: 'Task not found',
        code: 'TASK_NOT_FOUND'
      });
    }
    if (role === RoleType.ADMIN || role === RoleType.SUPER_ADMIN) {
      return task;
    }
    const canView =
      task.createdById === currentUserId || task.assignToId === currentUserId;

    if (!canView) {
      throw new ForbiddenException({
        message: 'You do not have permisstion to view this task',
        code: 'TASK_FORBIDDEN'
      });
    }
    return task;
  }

  //UpdateTask
  async updateTask(
    currentUserId: string,
    role: RoleType,
    taskId: string,
    updateTaskDto: UpdateTaskDto
  ): Promise<ResponseTaskDto> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId, deletedAt: null }
    });

    if (!task) {
      throw new NotFoundException({
        message: 'Task not found',
        code: 'TASK_NOT_FOUND'
      });
    }

    //employeeไม่สามารถupdate taskที่adminเป็นคนสร้างและassign to employee

    //employeeไม่สามารถupdate taskคนอื่นได้
    if (role === RoleType.EMPLOYEE && task.createdById !== currentUserId) {
      throw new ForbiddenException({
        message: 'You cannot update this task',
        code: 'TASK_FORBIDDEN'
      });
    }

    const updatedTask = await this.prisma.task.update({
      where: { id: taskId, deletedAt: null },
      data: updateTaskDto,
      select: taskDetailSelect
    });

    if (updateTaskDto.assignToId && updateTaskDto.assignToId !== task.assignToId) {
      this.notificationService.createNotification({
        userId: updateTaskDto.assignToId,
        type: NotificationType.TASK_ASSIGNED,
        title: 'Task assigned to you',
        body: `You have been assigned to "${task.title}"`,
        taskId: task.id,
      }).catch(() => {});
    }

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
      where: { id: taskId, deletedAt: null }
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
      updateTaskDto.status === TaskStatus.DONE &&
      !task.isPersonal
    ) {
      throw new UnauthorizedException({
        message: 'Employee cannot set task to DONE',
        code: 'STATUS_NOT_ALLOWED'
      });
    }

    const updatedTask = await this.prisma.task.update({
      where: { id: taskId, deletedAt: null },
      data: {
        status: updateTaskDto.status
      },
      select: taskDetailSelect
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
      where: { id: taskId, deletedAt: null }
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
      where: { id: taskId, deletedAt: null },
      data: {
        deletedAt: new Date()
      }
    });
  }

  //GET comment by task pagination
  async getCommentByTask(
    currentUserId: string,
    role: RoleType,
    taskId: string,
    query: GetCommentsQueryDto
  ): Promise<{ data: CommentResponseDto[]; nextCursor: string | null }> {
    const { cursor, limit = 20 } = query;

    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        deletedAt: null
      },
      select: {
        id: true,
        isPersonal: true,
        projectId: true,
        assignToId: true,
        createdById: true
      }
    });

    if (!task) {
      throw new NotFoundException({
        message: 'Task not found',
        code: 'TASK_NOT_FOUND'
      });
    }

    // personal task comment ไม่ได้
    if (task.isPersonal) {
      throw new ForbiddenException({
        message: 'Personal task cannot have comments',
        code: 'COMMENT_NOT_ALLOWED'
      });
    }

    // check employee permission
    if (role === RoleType.EMPLOYEE) {
      const isRelated =
        task.assignToId === currentUserId || task.createdById === currentUserId;

      let isProjectMember = false;

      if (task.projectId) {
        const member = await this.prisma.projectMember.findFirst({
          where: {
            projectId: task.projectId,
            userId: currentUserId
          }
        });

        isProjectMember = !!member;
      }

      if (!isRelated && !isProjectMember) {
        throw new ForbiddenException({
          message: 'You cannot view comments of this task',
          code: 'COMMENT_FORBIDDEN'
        });
      }
    }

    const comments = await this.prisma.comment.findMany({
      where: {
        taskId,
      },

      orderBy: {
        createdAt: 'desc'
      },

      take: limit,

      ...(cursor && {
        skip: 1,
        cursor: { id: cursor }
      }),

      select: commentSelect
    });

    const nextCursor =
      comments.length === limit ? comments[comments.length - 1].id : null;

    return {
      data: comments,
      nextCursor
    };
  }

  // Create comment
  async createComment(
    currentUserId: string,
    role: RoleType,
    taskId: string,
    createCommentDto: CreateCommentDto
  ): Promise<CommentResponseDto> {
    // get task basic info
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, deletedAt: null },
      select: {
        id: true,
        title: true,
        projectId: true,
        assignToId: true,
        createdById: true,
        isPersonal: true
      }
    });
    if (!task) {
      throw new NotFoundException({
        message: 'Task not found',
        code: 'TASK_NOT_FOUND'
      });
    }
    if (task.isPersonal) {
      throw new ForbiddenException({
        message: 'Personal task cannot have comments',
        code: 'COMMENT_NOT_ALLOWED'
      });
    }

    // check permission
    if (role === RoleType.ADMIN || role === RoleType.SUPER_ADMIN) {
      // allowed
    } else {
      const isRelated =
        task.assignToId === currentUserId || task.createdById === currentUserId;
      let isProjectMember = false;
      if (task.projectId) {
        const member = await this.prisma.projectMember.findFirst({
          where: { projectId: task.projectId, userId: currentUserId }
        });
        isProjectMember = !!member;
      }
      if (!isRelated && !isProjectMember) {
        throw new ForbiddenException({
          message: 'You cannot comment on this task',
          code: 'COMMENT_FORBIDDEN'
        });
      }
    }

    const comment = await this.prisma.comment.create({
      data: {
        taskId,
        userId: currentUserId,
        content: createCommentDto.content
      },
      select: commentSelect
    });

    const taskTitle = task.title ?? 'a task';
    const notified = new Set<string>([currentUserId]);

    if (task.assignToId !== currentUserId) {
      notified.add(task.assignToId);
      this.notificationService.createNotification({
        userId: task.assignToId,
        type: NotificationType.TASK_COMMENT,
        title: 'New comment on your task',
        body: `Someone commented on "${taskTitle}"`,
        taskId,
      }).catch(() => {});
    }

    const prevCommenters = await this.prisma.comment.findMany({
      where: { taskId, deletedAt: null, userId: { notIn: [...notified] } },
      select: { userId: true },
      distinct: ['userId'],
    });

    for (const { userId } of prevCommenters) {
      notified.add(userId);
      this.notificationService.createNotification({
        userId,
        type: NotificationType.COMMENT_REPLY,
        title: 'New comment on a task you follow',
        body: `New activity on "${taskTitle}"`,
        taskId,
      }).catch(() => {});
    }

    return comment;
  }
}
