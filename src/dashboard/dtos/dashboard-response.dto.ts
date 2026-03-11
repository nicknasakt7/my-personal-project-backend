import { Exclude, Expose, Type } from 'class-transformer';
import { ActivityStreamDto } from './activity-stream.dto';
import { DashboardSummaryDto } from './dashboard-summary.dto';
import { SystemAlertDto } from './system-alert.dto';

@Exclude()
export class DashboardResponseDto {
  @Expose()
  @Type(() => DashboardSummaryDto)
  summary: DashboardSummaryDto;

  @Expose()
  @Type(() => SystemAlertDto)
  alerts: SystemAlertDto[];

  @Expose()
  @Type(() => ActivityStreamDto)
  activities: ActivityStreamDto[];
}
