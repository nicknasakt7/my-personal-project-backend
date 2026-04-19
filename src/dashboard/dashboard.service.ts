import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { DashboardResponseDto } from './dtos/dashboard-response.dto';
import { SystemAlertDto } from './dtos/system-alert.dto';
import { ProjectProgressResponseDto } from './dtos/project-progress-response.dto';
import {
  EmploymentStatus,
  ProjectStatus,
  TaskStatus
} from 'src/database/generate/database/prisma/enums';
import { TeamDistributionResponseDto } from './dtos/team-distribution-response.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}
  async getSummary(): Promise<DashboardResponseDto> {
    const now = new Date();

    const [
      totalWorkforce,
      activeMembers,
      inactiveMembers,
      activeProjects,
      completedProjects,
      overdueTasks
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({
        where: { status: EmploymentStatus.ACTIVE }
      }),
      this.prisma.user.count({
        where: {
          status: {
            in: [EmploymentStatus.INACTIVE, EmploymentStatus.LEAVE]
          }
        }
      }),
      this.prisma.project.count({
        where: {
          status: ProjectStatus.ACTIVE
        }
      }),
      this.prisma.project.count({
        where: {
          status: ProjectStatus.COMPLETED
        }
      }),

      this.prisma.task.count({
        where: {
          dueDate: { lt: now },
          status: { not: TaskStatus.DONE },
          deletedAt: null
        }
      })
    ]);

    const summary = {
      totalWorkforce,
      activeMembers,
      inactiveMembers,
      activeProjects,
      completedProjects,
      overdueTasks
    };

    const alerts: SystemAlertDto[] = [];

    if (overdueTasks > 0) {
      alerts.push({
        type: 'DANGER',
        message: `${overdueTasks} tasks are overdue across active projects`
      });
    }
    if (inactiveMembers > 0) {
      alerts.push({
        type: 'INFO',
        message: `${inactiveMembers} employees are currently inactive or on leave`
      });
    }
    if (activeProjects === 0) {
      alerts.push({
        type: 'WARNING',
        message: 'No active projects'
      });
    }
    const recentTasks = await this.prisma.task.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        assignTo: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    const activities = recentTasks.map((task) => ({
      id: task.id,
      message: `${task.assignTo.firstName} ${task.assignTo.lastName} assigned task "${task.title}"`,
      createdAt: task.createdAt
    }));

    return {
      summary,
      alerts,
      activities
    };
  }

  async projectProgress(): Promise<ProjectProgressResponseDto> {
    const projects = await this.prisma.project.findMany({
      where: {
        status: ProjectStatus.ACTIVE
      },
      take: 10,
      include: {
        tasks: {
          where: {
            deletedAt: null
          },
          select: {
            status: true
          }
        }
      }
    });
    const now = new Date();

    const data = projects.map((project) => {
      const totalTask = project.tasks.length;
      const completedTask = project.tasks.filter(
        (task) => task.status === TaskStatus.DONE
      ).length;

      const progressPercent =
        totalTask === 0 ? 0 : Math.round((completedTask / totalTask) * 100);

      let status: 'ON_TRACK' | 'DELAYED' | 'OVERDUE' = 'ON_TRACK';

      if (project.dueDate && project.dueDate < now) {
        status = 'OVERDUE';
      } else if (progressPercent < 50) {
        status = 'DELAYED';
      }

      return {
        projectId: project.id,
        projectTitle: project.title,
        dueDate: project.dueDate,
        completedTask,
        totalTask,
        progressPercent,
        status
      };
    });
    return { data };
  }

  async teamDistribution(): Promise<TeamDistributionResponseDto> {
    const users = await this.prisma.user.groupBy({
      by: ['position'],
      _count: {
        position: true
      }
    });

    const total = users.reduce((sum, u) => sum + u._count.position, 0);

    const data = users.map((u) => ({
      role: u.position,
      count: u._count.position,
      percent: Math.round((u._count.position / total) * 100)
    }));

    return { data };
  }
}
