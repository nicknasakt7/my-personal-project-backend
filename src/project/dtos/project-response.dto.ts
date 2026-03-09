import { ProjectStatus } from 'src/database/generate/database/prisma/enums';

export class ProjectResponseDto {
  id: string;

  title: string;

  description: string;

  status: ProjectStatus;

  dueDate?: Date | null;

  createdAt: Date;

  updatedAt: Date;
}
