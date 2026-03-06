import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/guards/auth.guard';
import { AuthModule } from './auth/auth.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

import { SecurityModule } from './shared/security/security.module';
import { ProjectModule } from './project/project.module';
import { TaskModule } from './task/task.module';
import { CommentModule } from './comment/comment.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    AuthModule,

    SecurityModule,
    ProjectModule,
    TaskModule,
    CommentModule,
    DashboardModule
  ],
  providers: [{ provide: APP_GUARD, useClass: AuthGuard }, HttpExceptionFilter]
})
export class AppModule {}
