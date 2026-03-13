import { PartialType, PickType } from '@nestjs/swagger';
import { BaseEmployeeDto } from './base-employee.dto';

export class UpdateEmployeeDto extends PartialType(
  PickType(BaseEmployeeDto, [
    'firstName',
    'lastName',
    'birthDate',
    'gender',
    'profileImageUrl',
    'profileImagePublicId'
  ] as const)
) {}
