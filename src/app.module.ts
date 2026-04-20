import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { SchedulerModule } from './scheduler/scheduler.module';

import { AuthModule } from './auth/auth.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

import { SecurityModule } from './shared/security/security.module';
import { ProjectModule } from './project/project.module';
import { TaskModule } from './task/task.module';
import { CommentModule } from './comment/comment.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { NotificationModule } from './notification/notification.module';
import { EmployeeModule } from './employee/employee.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TransfromInterceptor } from './common/interceptors/transform-interceptor';
import { AuthGuard } from './auth/guards/auth.guard';
import { RoleGuard } from './auth/guards/role.guard';
import { UploadModule } from './shared/upload/upload.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule,
    DatabaseModule,
    SchedulerModule,
    AuthModule,
    EmployeeModule,
    SecurityModule,
    ProjectModule,
    TaskModule,
    CommentModule,
    DashboardModule,
    UploadModule,
    NotificationModule
  ],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RoleGuard },
    { provide: APP_INTERCEPTOR, useClass: TransfromInterceptor },
    HttpExceptionFilter
  ]
})
export class AppModule {}
