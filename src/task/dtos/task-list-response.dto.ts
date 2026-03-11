import { Exclude, Expose } from 'class-transformer';
import { ResponseTaskDto } from './response-task.dto';

@Exclude()
export class TaskListResponseDto {
  @Expose()
  data: ResponseTaskDto[];

  @Expose()
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
