import { Exclude, Expose } from 'class-transformer';
import {
  TaskPriority,
  TaskStatus
} from 'src/database/generate/database/prisma/enums';

@Exclude()
export class ResponseTaskDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  description: string | null;

  @Expose()
  priority: TaskPriority;

  @Expose()
  status: TaskStatus;

  @Expose()
  dueDate: Date | null;

  @Expose()
  isPersonal: boolean;

  @Expose()
  projectId: string | null;

  @Expose()
  assignToId: string;

  @Expose()
  createdById: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  project?: {
    id: string;
    title: string;
  } | null;

  @Expose()
  assignTo?: {
    id: string;
    firstName: string;
    lastName: string;
  };

  @Expose()
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };

  @Expose()
  comments?: {
    id: string;
    content: string;
    createdAt: Date;
    user: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }[];
}
