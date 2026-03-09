import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import {
  EmploymentLevel,
  EmploymentStatus,
  PositionName,
  RoleType
} from 'src/database/generate/database/prisma/enums';

export class GetEmployeeQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsEnum(RoleType)
  role?: RoleType;

  @IsOptional()
  @IsEnum(EmploymentStatus)
  status?: EmploymentStatus;

  @IsOptional()
  @IsEnum(PositionName)
  position?: PositionName;

  @IsOptional()
  @IsEnum(EmploymentLevel)
  level?: EmploymentLevel;
}
