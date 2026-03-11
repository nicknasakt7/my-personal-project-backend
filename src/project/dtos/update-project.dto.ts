import { ProjectStatus } from 'src/database/generate/database/prisma/enums';

import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  dueDate?: Date | null;
}
