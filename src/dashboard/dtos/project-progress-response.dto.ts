import { Exclude, Expose } from 'class-transformer';
import { ProjectHealthDto } from './project-health.dto';

@Exclude()
export class ProjectProgressResponseDto {
  @Expose()
  data: ProjectHealthDto[];
}
