import { Controller, Delete, Get, Patch, Post } from '@nestjs/common';

@Controller('tasks')
export class TaskController {
  @Post()
  async createTask() {}

  @Get()
  async getAllTasks() {}

  @Get(':id')
  async getTaskDetail() {}

  @Patch(':id')
  async updateTask() {}

  @Patch(':id/status')
  async updateTaskStatus() {}

  @Delete(':id')
  async deleteTask() {}

  @Get('overdue')
  async getOverDueTask() {}

  @Get(':taskId/comments')
  async getCommentByTask() {}
}
