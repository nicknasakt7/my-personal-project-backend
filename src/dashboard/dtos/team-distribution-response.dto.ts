import { Exclude, Expose, Type } from 'class-transformer';
import { TeamDistributionItemDto } from './team-distribution-item.dto';

@Exclude()
export class TeamDistributionResponseDto {
  @Expose()
  @Type(() => TeamDistributionItemDto)
  data: TeamDistributionItemDto[];
}
