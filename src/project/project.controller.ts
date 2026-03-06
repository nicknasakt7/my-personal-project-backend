import { Controller, Delete, Get, Patch, Post } from '@nestjs/common';

@Controller('projects')
export class ProjectController {
  @Post()
  async createProject() {}

  @Get()
  async getAllProjects() {}

  @Get(':id')
  async getProductDetail() {}

  @Patch(':id')
  async updateProject() {}

  @Patch(':id/status')
  async cancelProject() {}

  @Delete(':id')
  async deleteProject() {}
}
