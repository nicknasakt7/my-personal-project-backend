import { Controller, Get, Patch, Param, ParseUUIDPipe } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/types/jwt-payload.type';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  getMyNotifications(@CurrentUser() user: JwtPayload) {
    return this.notificationService.getMyNotifications(user.sub);
  }

  @Get('unread-count')
  getUnreadCount(@CurrentUser() user: JwtPayload) {
    return this.notificationService.getUnreadCount(user.sub);
  }

  @Patch(':id/read')
  markAsRead(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.notificationService.markAsRead(user.sub, id);
  }

  @Patch('read-all')
  markAllAsRead(@CurrentUser() user: JwtPayload) {
    return this.notificationService.markAllAsRead(user.sub);
  }
}
