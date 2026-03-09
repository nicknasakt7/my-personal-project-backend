import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString
} from 'class-validator';
import { Trim } from 'src/common/decorators/trim.decorator';
import { Comment } from 'src/database/generate/database/prisma/client';
import {
  TaskPriority,
  TaskStatus
} from 'src/database/generate/database/prisma/enums';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @Trim()
  title: string;

  @IsString()
  @IsNotEmpty()
  @Trim()
  description: string;

  @IsEnum(TaskPriority)
  @IsNotEmpty()
  priority: TaskPriority;

  @IsEnum(TaskStatus)
  @IsNotEmpty()
  status: TaskStatus;

  @IsString()
  @IsOptional()
  @Trim()
  comment?: string;

  @IsDate()
  @Type(() => Date)
  dueDate: Date;

  @IsBoolean()
  @IsNotEmpty()
  isPersonal: boolean;

  @IsString()
  @IsNotEmpty()
  @Trim()
  assignToId: string;

  @IsString()
  @IsNotEmpty()
  @Trim()
  projectId: string | null;
}
