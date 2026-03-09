import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Trim } from 'src/common/decorators/trim.decorator';
import { ProjectStatus } from 'src/database/generate/database/prisma/enums';

export class BaseProjectDto {
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @Trim()
  title: string;

  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @IsEnum(ProjectStatus, {
    message:
      'Status must be one of the following values: ACTIVE, COMPLETED, CANCELED'
  })
  @IsNotEmpty({ message: 'Status is required' })
  status: ProjectStatus;

  @IsNotEmpty({ message: 'Dua date is required' })
  @IsDate({ message: 'Invalid date' })
  @Type(() => Date)
  dueDate?: Date | null;

  @IsString({ message: 'Created by id must be a string' })
  @IsNotEmpty({ message: 'Created by id is required' })
  createdById: string;

  @IsNotEmpty({ message: 'created at is required' })
  @IsDate({ message: 'Invalid date' })
  @Type(() => Date)
  createdAt: Date;

  @IsNotEmpty({ message: 'updared at is required' })
  @IsDate({ message: 'Invalid date' })
  @Type(() => Date)
  updatedAt: Date;
}
