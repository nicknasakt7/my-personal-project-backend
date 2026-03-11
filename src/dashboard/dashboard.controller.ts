import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  SerializeOptions,
  UseInterceptors
} from '@nestjs/common';
import { DashboardResponseDto } from './dtos/dashboard-response.dto';
import { DashboardService } from './dashboard.service';
import { ProjectProgressResponseDto } from './dtos/project-progress-response.dto';
import { Roles } from 'src/auth/decorators/roles-decorator';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Roles('ADMIN', 'SUPER_ADMIN')
  @SerializeOptions({ type: DashboardResponseDto })
  @Get('summary')
  async dashboardSummary(): Promise<DashboardResponseDto> {
    return this.dashboardService.getSummary();
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @SerializeOptions({ type: ProjectProgressResponseDto })
  @Get('project-progress')
  async projectProgress(): Promise<ProjectProgressResponseDto> {
    return this.dashboardService.projectProgress();
  }
}
