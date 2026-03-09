import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import {
  EmploymentLevel,
  EmploymentStatus,
  Gender,
  PositionName,
  RoleType
} from 'src/database/generate/database/prisma/enums';

@Exclude()
export class EmployeeResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiProperty()
  firstName: string;

  @Expose()
  @ApiProperty()
  lastName: string;

  @Expose()
  @ApiProperty({ nullable: true })
  birthDate: Date | null;

  @Expose()
  @ApiProperty()
  gender: Gender;

  @Expose()
  @ApiProperty({ nullable: true })
  profileImageUrl: string | null;

  @Expose()
  @ApiProperty()
  roleType: RoleType;

  @Expose()
  @ApiProperty()
  position: PositionName;

  @Expose()
  @ApiProperty()
  level: EmploymentLevel;

  @Expose()
  @ApiProperty()
  status: EmploymentStatus;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}
