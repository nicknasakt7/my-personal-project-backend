import { OmitType } from '@nestjs/swagger';
import { BaseEmployeeDto } from './base-employee.dto';
import {
  IsAlphanumeric,
  IsNotEmpty,
  IsString,
  MinLength
} from 'class-validator';
import { Trim } from 'src/common/decorators/trim.decorator';

export class CreateEmployeeDto extends OmitType(BaseEmployeeDto, [
  'profileImagePublicId',
  'profileImageUrl'
] as const) {
  @MinLength(6, { message: 'Password must contain 6 characters' })
  @IsAlphanumeric('en-US', {
    message: 'Password must contain only numbers and letters'
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @Trim()
  password: string;
}
