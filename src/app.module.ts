import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';

import { AuthModule } from './auth/auth.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

import { SecurityModule } from './shared/security/security.module';
import { ProjectModule } from './project/project.module';
import { TaskModule } from './task/task.module';
import { CommentModule } from './comment/comment.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { EmployeeModule } from './employee/employee.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TransfromInterceptor } from './common/interceptors/transform-interceptor';
import { AuthGuard } from './auth/guards/auth.guard';
import { RoleGuard } from './auth/guards/role.guard';
import { UploadModule } from './shared/upload/upload.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    AuthModule,
    EmployeeModule,
    SecurityModule,
    ProjectModule,
    TaskModule,
    CommentModule,
    DashboardModule,
    UploadModule
  ],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RoleGuard },
    { provide: APP_INTERCEPTOR, useClass: TransfromInterceptor },
    HttpExceptionFilter
  ]
})
export class AppModule {}
