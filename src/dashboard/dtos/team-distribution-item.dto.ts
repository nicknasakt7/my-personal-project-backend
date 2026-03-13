import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class TeamDistributionItemDto {
  @Expose()
  role: string;

  @Expose()
  count: number;

  @Expose()
  percent: number;
}
