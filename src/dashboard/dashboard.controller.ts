import { Controller, Get } from '@nestjs/common';

@Controller('dashboard')
export class DashboardController {
  @Get('summary')
  async dashboardSummary() {}

  @Get('project-progress')
  async projectProgress() {}
}
