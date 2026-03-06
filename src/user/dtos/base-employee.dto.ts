import { Type } from 'class-transformer';
import {
  IsAlphanumeric,
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength
} from 'class-validator';
import { Trim } from 'src/common/decorators/trim.decorator';
import {
  EmploymentLevel,
  EmploymentStatus,
  Gender,
  PositionName,
  RoleType
} from 'src/database/generate/database/prisma/enums';

export class BaseEmployeeDto {
  @IsNotEmpty({ message: 'Email is reqiured' })
  @IsString({ message: 'Email must be a string' })
  @IsEmail()
  @Trim()
  email: string;

  @MinLength(6, { message: 'Password must contain 6 characters' })
  @IsAlphanumeric('en-US', {
    message: 'Password cannot contaun ibly number and letter'
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @Trim()
  password: string;

  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  @Trim()
  firstName: string;

  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  @Trim()
  lastName: string;

  @IsNotEmpty({ message: 'Date is required' })
  @IsDate({ message: 'Invalid date' })
  @Type(() => Date)
  birthDate: Date;

  @IsEnum(Gender, {
    message: 'Gender must be one of the following values: MALE, FEMALE, OTHER'
  })
  @IsNotEmpty({ message: 'Gender is required' })
  gender: Gender;

  profileImageUrl?: string;

  profileImagePublicId?: string;

  @IsEnum(RoleType, {
    message: 'Role type must choose one of the options'
  })
  @IsNotEmpty({ message: 'Role type is required' })
  roleType: RoleType;

  @IsEnum(PositionName, {
    message: 'Position name must choose one of the options'
  })
  @IsNotEmpty({ message: 'Position name is required' })
  position: PositionName;

  @IsEnum(EmploymentLevel, {
    message: 'Employment level must choose one of the options'
  })
  @IsNotEmpty({ message: 'Employment level is required' })
  level: EmploymentLevel;

  @IsEnum(EmploymentStatus, {
    message: 'Employment status must choose one of the options'
  })
  @IsNotEmpty({ message: 'Employment status is required' })
  status: EmploymentStatus;
}
