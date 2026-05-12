import { Expose, Type } from 'class-transformer';
import { ProjectResponseDto } from './project-response.dto';

export class GetAllProjectsResponseDto {
  @Expose()
  @Type(() => ProjectResponseDto)
  projects: ProjectResponseDto[];

  @Expose()
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}
