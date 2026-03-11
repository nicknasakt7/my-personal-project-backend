import { Exclude, Expose, Type } from 'class-transformer';
import { ResponseTaskDto } from './response-task.dto';

@Exclude()
export class TaskListResponseDto {
  @Expose()
  @Type(() => ResponseTaskDto)
  tasks: ResponseTaskDto[];

  @Expose()
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
