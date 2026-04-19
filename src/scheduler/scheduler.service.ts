import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/database/prisma.service';
import {
  ProjectStatus,
  TaskStatus
} from 'src/database/generate/database/prisma/client';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async markOverdueProjects() {
    const now = new Date();

    const { count } = await this.prisma.project.updateMany({
      where: {
        dueDate: { lt: now },
        deletedAt: null,
        status: {
          notIn: [ProjectStatus.COMPLETED, ProjectStatus.CANCELED, ProjectStatus.OVERDUE]
        }
      },
      data: { status: ProjectStatus.OVERDUE }
    });

    this.logger.log(`Marked ${count} project(s) as OVERDUE`);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async markOverdueTasks() {
    const now = new Date();

    const { count } = await this.prisma.task.updateMany({
      where: {
        dueDate: { lt: now },
        deletedAt: null,
        status: {
          notIn: [TaskStatus.DONE, TaskStatus.OVERDUE, TaskStatus.CANCELED]
        }
      },
      data: { status: TaskStatus.OVERDUE }
    });

    this.logger.log(`Marked ${count} task(s) as OVERDUE`);
  }
}
