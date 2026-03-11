import {
  TaskPriority,
  TaskStatus
} from 'src/database/generate/database/prisma/enums';

export class GetTaskQueryDto {
  search?: string;
  page?: number;
  limit?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignTo?: string;
}
