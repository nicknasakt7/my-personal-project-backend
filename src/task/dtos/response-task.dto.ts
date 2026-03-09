import {
  TaskPriority,
  TaskStatus
} from 'src/database/generate/database/prisma/enums';

export class ResponseTaskDto {
  id: string;

  title: string;

  description: string | null;

  priority: TaskPriority;

  status: TaskStatus;

  dueDate: Date | null;

  isPersonal: boolean;

  projectId: string | null;

  assignToId: string;

  createdById: string;

  createdAt: Date;

  updatedAt: Date;
}
