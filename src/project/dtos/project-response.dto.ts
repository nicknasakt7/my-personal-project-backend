import { Exclude, Expose } from 'class-transformer';
import {
  PositionName,
  ProjectStatus
} from 'src/database/generate/database/prisma/enums';

@Exclude()
export class ProjectResponseDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  status: ProjectStatus;

  @Expose()
  dueDate?: Date | null;

  @Expose()
  createdById: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  createdBy?: {
    firstName: string;
    lastName: string;
    position: PositionName;
    profileImageUrl: string | null;
  };

  @Expose()
  projectMembers?: {
    userId: string;
    user: {
      firstName: string;
      lastName: string;
      position: PositionName;
      profileImageUrl: string | null;
    };
  }[];

  @Expose()
  _count?: {
    tasks: number;
  };
}
