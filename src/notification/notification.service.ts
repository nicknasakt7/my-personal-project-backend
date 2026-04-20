import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { NotificationType } from 'src/database/generate/database/prisma/enums';

type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  taskId?: string;
};

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async createNotification(input: CreateNotificationInput) {
    return this.prisma.notification.create({ data: input });
  }

  async getMyNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: { task: { select: { id: true, title: true } } },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({ where: { userId, isRead: false } });
  }

  async markAsRead(userId: string, notificationId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}
