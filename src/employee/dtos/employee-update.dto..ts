import { PickType } from '@nestjs/swagger';
import { BaseEmployeeDto } from './base-employee.dto';

export class UpdateEmployeeDto extends PickType(BaseEmployeeDto, [
  'firstName',
  'lastName',
  'birthDate',
  'gender'
] as const) {}
