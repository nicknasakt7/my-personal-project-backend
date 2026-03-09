import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min
} from 'class-validator';

import { ProjectStatus } from 'src/database/generate/database/prisma/enums';

export enum ProjectFilter {
  ALL = 'ALL',
  ACTIVE = 'ACTIVE',
  AT_RISK = 'AT_RISK',
  DELAYED = 'DELAYED',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED'
}

export class GetProjectsQueryDto {
  @IsOptional()
  @IsNumber()
  month?: number;

  @IsOptional()
  @IsNumber()
  year?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status: ProjectStatus;

  @IsOptional()
  @IsString()
  createdBy?: string;
}
