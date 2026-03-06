import { OmitType } from '@nestjs/swagger';
import { BaseEmployeeDto } from './base-employee.dto';

export class CreateEmployeeDto extends OmitType(BaseEmployeeDto, [
  'profileImagePublicId',
  'profileImageUrl'
]) {}
